import type Sequencer from '@/components/sequencer/sequencer';
import { devLog } from '@/shared/state/devMode';
import { getLLMSettings } from '@/components/aimode/shared/stores/llmSettingsStore.js';
import { getRemiSettings } from '@/components/aimode/shared/settings/getRemiSettings.js';


/**
 * Determines the startBeat and endBeat range for an autocomplete context window.
 * Ensures values are snapped to whole beats.
 * @param sequencer - The sequencer to analyze.
 * @returns A tuple of [startBeat, endBeat].
 */
export function getStartBeatAndEndBeat(sequencer: Sequencer): [number, number] {
  const llmSettings = getLLMSettings();
  const contextLengthBeats = llmSettings.context.contextBeats;

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