// src/components/aimode/features/autocomplete/helpers/getAutoComplete.ts

import { devLog } from '@/shared/state/devMode';

import { extractRemiContext } from '@/components/aimode/shared/context/extractRemiContext.js';
import { clipRemiContinuation } from '@/shared/llm/models/remi/clipRemiContinuation.js';
import { remiDecode } from '@/shared/utils/musical/remi/remiUtils.js';

import { getAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { getSequencerById, getSequencers, getLastActiveSequencerId } from '@/components/sequencer/stores/sequencerStore.js';
import { disableAutocompleteToggle, enableAutocompleteToggle } from '@/components/globalControls/controls/autoCompleteButtonControls.js';
import { setAIPreviewNotes, clearAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { normalizeRemiPositions } from '@/shared/llm/models/remi/normalizeRemiPositions.js';
import { getStartBeatAndEndBeat, getAutoCompleteStartBar, getClipBoundaryFromEndBeat } from '@/components/aimode/shared/helpers/contextHelpers.js';
import { parseRemiTokens } from '@/shared/llm/models/remi/parseRemiTokens.js';

import { getRemiSettings } from '@/components/aimode/shared/settings/getRemiSettings.js';
import { getLLMSettings } from '@/components/aimode/shared/stores/llmSettingsStore.js';

import { AutoCompletePromptBuilder } from '@/components/aimode/features/autocomplete/prompts/autoCompletePromptBuilder.js';
import { callLLM } from '@/shared/llm/LLMCallerService.js';
import { remiResponseFormat } from '@/shared/llm/models/schemas/remiResponseFormat.js';

import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions';
import type Sequencer from '@/components/sequencer/sequencer';
import type { LLMModel } from '@/shared/llm/interfaces/LLMInterfaces';

/**
 * Handles running AI Autocomplete for the current active sequencer.
 * @param source - Optional string for log context (e.g., 'click', 'keypress')
 */
export async function handleUserAutoCompleteRequest(source: string = 'unknown'): Promise<void> {
  const lastActiveSequencerId = getLastActiveSequencerId();
  if (lastActiveSequencerId === null) {
    console.warn('No active sequencer to apply autocomplete to.');
    return;
  }

  const sequencer = getSequencerById(lastActiveSequencerId);
  if (!sequencer) {
    console.error(`Sequencer with id ${lastActiveSequencerId} not found.`);
    return;
  }

  // Lock UI button to prevent retriggers
  disableAutocompleteToggle();

  clearAIPreviewNotes();
  sequencer.matrix?.invalidateAIAutocompleteRenderer();

  const [startBeat, endBeat] = getStartBeatAndEndBeat(sequencer);

  devLog(`[AutoComplete] Running autocomplete for beats ${startBeat} to ${endBeat} on sequencer ${lastActiveSequencerId} via ${source}`);

  // === Highlight the target bar and start animation loop ===
  const startBar = getAutoCompleteStartBar(sequencer);
  sequencer.matrix?.setActiveAutocompleteBar(startBar);
  sequencer.matrix?.startAIAutocompleteAnimationLoop();

  try {
    await runRemiContinuationPipeline(lastActiveSequencerId, getSequencers(), startBeat, endBeat);
  } catch (err) {
    console.error('Autocomplete failed:', err);
  } finally {
    enableAutocompleteToggle();

    // === If no preview notes were generated, stop animation loop ===
    const previewNotes = getAIPreviewNotes();
    if (previewNotes.length === 0) {
      devLog('[AutoComplete] No preview notes generated. Stopping animation loop.');
      sequencer.matrix?.stopAIAutocompleteAnimationLoop();
    }

    // Clear active bar highlight (regardless of success/failure)
    sequencer.matrix?.setActiveAutocompleteBar(null);
  }
}

/**
 * Gets an AI-generated REMI continuation for the given sequencer context.
 *
 * @param activeSequencerId - ID of the primary sequencer to continue.
 * @param sequencers - List of all sequencers (primary + others).
 * @param startBeat - Start of the context range.
 * @param endBeat - End of the context range.
 * @param model - The LLM model to use (e.g., 'gpt-4o').
 * @param continuationBeats - How many beats to request continuation for.
 * @param remiSettings - Optional REMI encoding settings.
 * @returns void
 */
export async function runRemiContinuationPipeline(
  activeSequencerId: number,
  sequencers: Sequencer[],
  startBeat: number,
  endBeat: number,
  model: LLMModel = 'gpt-4o',
  continuationBeats: number = 4,
): Promise<void> {
  const remiSettings: RemiEncodeOptions = getRemiSettings();

  // === Step 1: Extract Context ===
  const context = extractRemiContext(activeSequencerId, sequencers, startBeat, endBeat, remiSettings);

  // === Step 2: Build Prompt ===
  const promptBuilder = new AutoCompletePromptBuilder();
  const prompt = promptBuilder.buildPrompt(context, { continuationBeats, llmSettings: getLLMSettings() });

  // === Step 3: Compute Clip Boundary from endBeat ===
  const beatsPerBar = remiSettings.beatsPerBar ?? 4;
  const stepsPerBeat = remiSettings.stepsPerBeat ?? 4;
  const { clipAfterBar, clipAfterPosition } = getClipBoundaryFromEndBeat(endBeat, beatsPerBar, stepsPerBeat);

  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // === Step 4: Call LLM ===
    const remiTokens = await callLLM(model, prompt, remiResponseFormat);

    // === Step 5: Parse Tokens into RemiEvents ===
    const llmContinuationRemi = parseRemiTokens(remiTokens);

    // === Step 6: Normalize REMI Positions ===
    const normalizedContinuationRemi = normalizeRemiPositions(llmContinuationRemi, beatsPerBar, stepsPerBeat);

    // === Step 7: Clip Continuation ===
    const clippedContinuation = clipRemiContinuation(normalizedContinuationRemi, clipAfterBar, clipAfterPosition);

    // === Step 8: Decode Remi to notes ===
    const decodedNotes = remiDecode(clippedContinuation, remiSettings);

    devLog(`[AutoComplete] Attempt ${attempt}: Decoded Notes:`, decodedNotes);

    if (decodedNotes.length > 0) {
      devLog('[AutoComplete] Final Decoded Notes:', decodedNotes);
      setAIPreviewNotes(decodedNotes);

      const activeSequencer = getSequencerById(activeSequencerId);
      if (activeSequencer) activeSequencer.redraw();

      return;
    }

    devLog(`[AutoComplete] Attempt ${attempt}: No new notes after clip boundary. Retrying...`);
  }

  devLog('[AutoComplete] All retry attempts failed to generate new continuation notes.');
}
