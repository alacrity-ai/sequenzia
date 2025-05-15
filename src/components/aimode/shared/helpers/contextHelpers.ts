// src/components/aimode/shared/helpers/contextHelpers.ts

import type Sequencer from '@/components/sequencer/sequencer';

import { devLog } from '@/shared/state/devMode';
import { getLLMSettings } from '@/components/aimode/shared/stores/llmSettingsStore.js';
import { getRemiSettings } from '@/components/aimode/shared/settings/getRemiSettings.js';
import { getAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore';

/**
 * Determines the startBeat and endBeat range for an autocomplete context window.
 * Ensures values are snapped to whole beats.
 * @param sequencer - The sequencer to analyze.
 * @returns A tuple of [startBeat, endBeat].
 */
export function getStartBeatAndEndBeat(sequencer: Sequencer): [number, number] {
  const llmSettings = getLLMSettings();
  const contextLengthBeats = llmSettings.context.contextBeats;

  const targetBeat = getAutoCompleteTargetBeat();
  const notes = sequencer.notes;

  if (targetBeat !== null) {
    // === We have an explicit target beat from user actions ===

    // EndBeat should still snap to whole beat
    const endBeat = Math.ceil(targetBeat);

    // StartBeat goes back by context window, clamped to 0
    const startBeat = Math.max(0, endBeat - contextLengthBeats);

    return [startBeat, endBeat];
  }

  // === Fallback to legacy behavior if no target beat is available ===
  if (notes.length === 0) return [0, contextLengthBeats];

  const lastNote = notes.reduce((latest, note) => {
    const latestEnd = latest.start + latest.duration;
    const noteEnd = note.start + note.duration;
    return noteEnd > latestEnd ? note : latest;
  });

  const rawEndBeat = lastNote.start + lastNote.duration;
  const endBeat = Math.ceil(rawEndBeat);
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