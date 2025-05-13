// src/components/aimode/autocomplete/helpers/getAutoComplete.ts

import { devLog } from '@/shared/state/devMode';

import { extractContext, clipContinuationAfterPrimary } from '@/components/aimode/autocomplete/services/contextExtractionService';
import { buildPrompt } from '@/components/aimode/autocomplete/services/llm/promptBuilderService';
import { callLLM } from '@/components/aimode/autocomplete/services/llm/llmCallerService';
import { remiDecode } from '@/shared/utils/musical/remi/remiUtils.js';

import { getAIPreviewNotes } from '@/components/aimode/autocomplete/stores/autoCompleteStore';
import { getSequencerById, getSequencers, getLastActiveSequencerId } from '@/components/sequencer/stores/sequencerStore';
import { disableAutocompleteToggle, enableAutocompleteToggle } from '@/components/globalControls/controls/autoCompleteButtonControls';
import { setAIPreviewNotes, clearAIPreviewNotes } from '@/components/aimode/autocomplete/stores/autoCompleteStore';
import { normalizeLLMPositions } from '@/components/aimode/autocomplete/services/contextExtractionService';
import { getAutoCompleteContextBeats } from '@/components/userSettings/store/userConfigStore';
import { getRemiSettings } from './getRemiSettings';

import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions';
import type Sequencer from '@/components/sequencer/sequencer';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import type { LLMModel } from '@/components/userSettings/interfaces/OpenAISettings';

/**
 * Handles running AI Autocomplete for the current active sequencer.
 * @param source - Optional string for log context (e.g., 'click', 'keypress')
 */
export async function handleRunAIAutocomplete(source: string = 'unknown'): Promise<void> {
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
    await runAIAutoComplete(lastActiveSequencerId, getSequencers(), startBeat, endBeat);
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
export async function runAIAutoComplete(
  activeSequencerId: number,
  sequencers: Sequencer[],
  startBeat: number,
  endBeat: number,
  model: LLMModel = 'gpt-4o',
  continuationBeats: number = 4,
): Promise<void> {
  const remiSettings: RemiEncodeOptions = getRemiSettings();

  // === Step 1: Extract Context ===
  const context = extractContext(activeSequencerId, sequencers, startBeat, endBeat, remiSettings);

  // === Step 2: Build Prompt ===
  const prompt = buildPrompt(context, continuationBeats);

  // === Step 3: Compute Clip Boundary from endBeat ===
  const beatsPerBar = remiSettings?.beatsPerBar ?? 4;
  const stepsPerBeat = remiSettings?.stepsPerBeat ?? 4;

  const { clipAfterBar, clipAfterPosition } = getClipBoundaryFromEndBeat(endBeat, beatsPerBar, stepsPerBeat);

  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // === Step 4: Call LLM ===
    const remiTokens = await callLLM(model, prompt);

    // === Step 5: Parse Tokens into RemiEvents ===
    const llmContinuationRemi: RemiEvent[] = remiTokens.map(token => {
      const [type, ...valueParts] = token.split(' ');
      const value = isNaN(Number(valueParts[0])) ? valueParts.join(' ') : Number(valueParts[0]);
      return { type: type as RemiEvent['type'], value } as RemiEvent;
    });

    // == Step 6: Normalize LLM REMI Positions 
    // (In the event that the LLM adds extra beats to a bar, we just roll them into the next bar.)
    const normalizedContinuationRemi = normalizeLLMPositions(llmContinuationRemi, beatsPerBar, stepsPerBeat);

    // === Step 7: Clip Continuation ===
    const clippedContinuation = clipContinuationAfterPrimary(normalizedContinuationRemi, clipAfterBar, clipAfterPosition);

    // === Step 8: Decode Remi to notes ===
    const decodedNotes = remiDecode(clippedContinuation, remiSettings);

    devLog(`[AutoComplete] Attempt ${attempt}: Decoded Notes:`, decodedNotes);

    if (decodedNotes.length > 0) {
      devLog('[AutoComplete] Final Decoded Notes:', decodedNotes);
      // Add the AI Autocomplete notes to the store
      setAIPreviewNotes(decodedNotes);

      // Trigger a redraw of the grid
      const activeSequencer = getSequencerById(activeSequencerId);
      if (activeSequencer) {
        activeSequencer.redraw();
      }

      return;
    }

    devLog(`[AutoComplete] Attempt ${attempt}: No new notes after clip boundary. Retrying...`);
  }

  devLog('[AutoComplete] All retry attempts failed to generate new continuation notes.');
}


/**
 * Determines the startBeat and endBeat range for an autocomplete context window.
 * Ensures values are snapped to whole beats.
 * @param sequencer - The sequencer to analyze.
 * @returns A tuple of [startBeat, endBeat].
 */
export function getStartBeatAndEndBeat(sequencer: Sequencer): [number, number] {
  const contextLengthBeats = getAutoCompleteContextBeats();

  const notes = sequencer.notes;
  if (notes.length === 0) return [0, contextLengthBeats];

  // Find the last note by highest start+duration (true end position)
  const lastNote = notes.reduce((latest, note) => {
    const latestEnd = latest.start + latest.duration;
    const noteEnd = note.start + note.duration;
    return noteEnd > latestEnd ? note : latest;
  });

  const rawEndBeat = lastNote.start + lastNote.duration;

  // Round up endBeat to nearest whole beat (so we cover the whole note duration)
  const endBeat = Math.ceil(rawEndBeat);

  // Start beat goes back by context length, clamped to 0
  const startBeat = Math.max(0, endBeat - contextLengthBeats);

  return [startBeat, endBeat];
}

/**
 * Computes clipAfterBar and clipAfterPosition from a given endBeat.
 * Handles beat-to-position conversion correctly.
 * Logs debug info for tracing clipping boundaries.
 */
export function getClipBoundaryFromEndBeat(
  endBeat: number,
  beatsPerBar: number,
  stepsPerBeat: number
): { clipAfterBar: number, clipAfterPosition: number } {
  const clipAfterBar = Math.floor(endBeat / beatsPerBar);
  const clipAfterPosition = Math.round((endBeat % beatsPerBar) * stepsPerBeat);

  devLog('[AutoComplete] Computed Clip Boundary:', {
    endBeat,
    beatsPerBar,
    stepsPerBeat,
    clipAfterBar,
    clipAfterPosition
  });

  return { clipAfterBar, clipAfterPosition };
}

/**
 * Gets the measure (bar index) where autocomplete will start.
 * This is the measure immediately following the current context endBeat.
 *
 * @param sequencer - The sequencer to analyze.
 * @returns The bar index where autocomplete continuation starts.
 */
export function getAutoCompleteStartBar(sequencer: Sequencer): number {
  const [ , endBeat ] = getStartBeatAndEndBeat(sequencer);

  const remiSettings = getRemiSettings();
  const beatsPerBar = remiSettings?.beatsPerBar ?? 4;

  const startBar = Math.floor(endBeat / beatsPerBar);

  return startBar;
}