// src/components/aimode/features/autocomplete/helpers/getAutoComplete.ts

import { devLog } from '@/shared/state/devMode';

import { extractRemiBeforeAfterContext } from '@/components/aimode/shared/context/extractRemiBeforeAfterContext.js';
import { clipRemiContinuation } from '@/shared/llm/tasks/remi/helpers/clipRemiContinuation.js';
import { hasGapForRemiContinuation } from '@/shared/llm/tasks/remi/helpers/hasGapForRemiContinuation.js';
import { remiDecode } from '@/shared/utils/musical/remi/remiUtils.js';

import { getSequencerById, getLastActiveSequencerId } from '@/components/sequencer/stores/sequencerStore.js';
import { disableAutocompleteToggle, enableAutocompleteToggle } from '@/components/globalControls/controls/autoCompleteButtonControls.js';
import { setAIPreviewNotes, clearAIPreviewNotes, getAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { normalizeRemiPositions } from '@/shared/llm/tasks/remi/helpers/normalizeRemiPositions.js';
import { getStartBeatAndEndBeat, getAutoCompleteStartBar, getClipBoundaryFromEndBeat } from '@/components/aimode/shared/helpers/contextHelpers.js';
import { getNextNoteStartBeat } from '@/components/sequencer/matrix/utils/getNextNoteStartBeat.js';
import { convertBeatToBarPosition } from '@/components/sequencer/matrix/utils/convertBeatsToBarPosition.js';

import { getRemiSettings } from '@/components/aimode/shared/settings/getRemiSettings.js';
import { getLLMSettings } from '@/components/aimode/shared/stores/llmSettingsStore.js';

import { ContextAwarePromptBuilder } from '@/components/aimode/features/autocomplete/prompts/ContextAwarePromptBuilder.js';
import { getRemiContinuation } from '@/shared/llm/tasks/remi/remiContinuationService.js';
import { shiftLLMContinuationToEndBeat } from '@/shared/llm/tasks/remi/helpers/shiftLLMContinuationToEndBeat.js';

import { drawGlobalMiniContour } from '@/shared/playback/helpers/drawGlobalMiniContour.js';

import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions';
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
  drawGlobalMiniContour();
  sequencer.matrix?.invalidateAIAutocompleteRenderer();

  const [startBeat, endBeat] = getStartBeatAndEndBeat(sequencer);

  devLog(`[AutoComplete] Running autocomplete for beats ${startBeat} to ${endBeat} on sequencer ${lastActiveSequencerId} via ${source}`);

  // === Highlight the target bar and start animation loop ===
  const startBar = getAutoCompleteStartBar(sequencer);
  sequencer.matrix?.setActiveAutocompleteBar(startBar);
  sequencer.matrix?.startAIAutocompleteAnimationLoop();

  try {
    await runRemiContinuationPipeline(lastActiveSequencerId, endBeat);
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
 * @param autoCompleteBeat - Beat where the autocomplete should start.
 * @param model - The LLM model to use (e.g., 'gpt-4o').
 * @param continuationBeats - How many beats to request continuation for.
 * @param remiSettings - Optional REMI encoding settings.
 * @returns void
 */
export async function runRemiContinuationPipeline(
  activeSequencerId: number,
  autoCompleteBeat: number,
  model: LLMModel = 'gpt-4o',
  continuationBeats: number = 4,
): Promise<void> {
  
  devLog('[AutoComplete] Running REMI Continuation Pipeline with LLM settings:', getLLMSettings());

  const activeSequencer = getSequencerById(activeSequencerId);
  if (!activeSequencer) {
    console.error(`Sequencer with id ${activeSequencerId} not found.`);
    return;
  }

  if (!hasGapForRemiContinuation(activeSequencer, autoCompleteBeat, continuationBeats)) {
    devLog('[AutoComplete] No available gap for REMI continuation. Aborting autocomplete.');
    return;
  }

  // === Step 1: Extract Context ===
  const contextBeats = getLLMSettings().context.contextBeats;
  const remiSettings: RemiEncodeOptions = getRemiSettings();
  const remiContext = extractRemiBeforeAfterContext(activeSequencer.notes, autoCompleteBeat, contextBeats, remiSettings);

  // === Step 2: Build Prompt ===
  const promptBuilder = new ContextAwarePromptBuilder();
  const prompt = promptBuilder.buildPrompt(remiContext, { continuationBeats, llmSettings: getLLMSettings() });

  // === Step 3: Setup Constants ===
  const beatsPerBar = remiSettings.beatsPerBar ?? 4;
  const stepsPerBeat = remiSettings.stepsPerBeat ?? 4;
  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // === Step 4: Call LLM ===
    const llmContinuationRemi = await getRemiContinuation(model, prompt);
    devLog('[AutoComplete] Raw LLM Continuation:', llmContinuationRemi);

    // === Step 5: Normalize LLM Positions ===
    const normalizedContinuationRemi = normalizeRemiPositions(llmContinuationRemi, beatsPerBar, stepsPerBeat);

    // === Step 5.5: Shift to Desired endBeat ===
    const shiftedContinuationRemi = shiftLLMContinuationToEndBeat(
      normalizedContinuationRemi,
      autoCompleteBeat,
      beatsPerBar,
      stepsPerBeat
    );

    // === Step 6: Clip Continuation ===
    const { clipAfterBar, clipAfterPosition } = getClipBoundaryFromEndBeat(autoCompleteBeat, beatsPerBar, stepsPerBeat);
    const nextNoteBeat = getNextNoteStartBeat(activeSequencer, autoCompleteBeat);

    let clipBeforeBar: number | undefined;
    let clipBeforePosition: number | undefined;

    if (nextNoteBeat !== null) {
      ({ bar: clipBeforeBar, position: clipBeforePosition } = convertBeatToBarPosition(nextNoteBeat, beatsPerBar, stepsPerBeat));
    }

    const clippedContinuation = clipRemiContinuation(
      shiftedContinuationRemi,
      clipAfterBar,
      clipAfterPosition,
      clipBeforeBar,
      clipBeforePosition
    );

    // === Step 7: Decode REMI to Notes ===
    const decodedNotes = remiDecode(clippedContinuation, remiSettings);

    devLog(`[AutoComplete] Attempt ${attempt}: Decoded Notes:`, decodedNotes);

    if (decodedNotes.length > 0) {
      devLog('[AutoComplete] Final Decoded Notes:', decodedNotes);
      setAIPreviewNotes(decodedNotes);
      drawGlobalMiniContour();
      
      const activeSequencer = getSequencerById(activeSequencerId);
      if (activeSequencer) activeSequencer.redraw();

      return;
    }

    devLog(`[AutoComplete] Attempt ${attempt}: No new notes after clip boundary. Retrying...`);
  }

  devLog('[AutoComplete] All retry attempts failed to generate new continuation notes.');
}