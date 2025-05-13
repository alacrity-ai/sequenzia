// src/components/aimode/autocomplete/services/contextExtractionService.ts

import type Sequencer from "@/components/sequencer/sequencer";
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import type { Note } from '@/shared/interfaces/Note.js';
import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions.js';

import { devLog } from '@/shared/state/devMode';
import { remiEncode } from '@/shared/utils/musical/remi/remiUtils.js';

export interface ExtractedContext {
  primaryTrackRemi: RemiEvent[];
  otherTracksRemi: RemiEvent[][];
  startBeat: number;
  endBeat: number;
}

export function extractContext(
  activeSequencerId: number,
  sequencers: Sequencer[],
  startBeat: number,
  endBeat: number,
  remiSettings?: RemiEncodeOptions
): ExtractedContext {
  const isNoteInRange = (note: Note) =>
    note.start >= startBeat && note.start < endBeat;

  const primarySequencer = sequencers.find(seq => seq.id === activeSequencerId);

  if (!primarySequencer) {
    throw new Error(`Sequencer with id ${activeSequencerId} not found.`);
  }

  const primaryNotes = primarySequencer.notes.filter(isNoteInRange);
  const primaryTrackRemi = remiEncode(primaryNotes, remiSettings);

  const otherTracksRemi: RemiEvent[][] = sequencers
    .filter(seq => seq.id !== activeSequencerId)
    .map(seq => {
      const notesInRange = seq.notes.filter(isNoteInRange);
      return remiEncode(notesInRange, remiSettings);
    });

  devLog('[AutoComplete] Extracted Context:', {
    primaryTrackRemi,
    otherTracksRemi,
    startBeat,
    endBeat
  });

  return {
    primaryTrackRemi,
    otherTracksRemi,
    startBeat,
    endBeat
  };
}

/**
 * Clips LLM continuation RemiEvents to only include events after the given clip point (Bar, Position).
 *
 * Bars are preserved only if they precede surviving Positions.
 *
 * @param llmContinuationRemi - Full LLM response RemiEvents.
 * @param clipAfterBar - Clip point Bar.
 * @param clipAfterPosition - Clip point Position within the bar.
 * @returns Clipped continuation RemiEvents.
 */
export function clipContinuationAfterPrimary(
  llmContinuationRemi: RemiEvent[],
  clipAfterBar: number,
  clipAfterPosition: number
): RemiEvent[] {
  const clippedContinuation: RemiEvent[] = [];

  let currentLLMBar = 0;
  let pendingBar: RemiEvent | null = null;
  let acceptCurrentPosition = false;

  devLog('[AutoComplete] Clipping LLM Continuation:', {
    llmContinuationRemi,
    clipAfterBar,
    clipAfterPosition
  });

  for (const event of llmContinuationRemi) {
    if (event.type === 'Bar') {
      pendingBar = event; // Defer adding until we see an accepted Position
      currentLLMBar = event.value;
      continue;
    }

    if (event.type === 'Position') {
      const shouldAccept =
        currentLLMBar > clipAfterBar ||
        (currentLLMBar === clipAfterBar && event.value >= clipAfterPosition);

      acceptCurrentPosition = shouldAccept;

      if (acceptCurrentPosition) {
        // Emit pendingBar if exists and not yet flushed
        if (pendingBar) {
          clippedContinuation.push(pendingBar);
          pendingBar = null;
        }
        clippedContinuation.push(event);
      }

      continue; // Next event
    }

    // Non-Position event (Pitch, Duration, Velocity)
    // Only emit if last Position was accepted
    if (acceptCurrentPosition) {
      clippedContinuation.push(event);
    }
  }

  devLog('[AutoComplete] Clipped LLM Continuation:', clippedContinuation);

  return clippedContinuation;
}


/**
 * Normalizes Position overflow in LLM REMI output by rolling Positions into correct Bar numbers.
 * 
 * @param llmRemi - The raw LLM REMI continuation.
 * @param beatsPerBar - Beats per bar (from remiSettings).
 * @param stepsPerBeat - Steps per beat (from remiSettings).
 * @returns Normalized REMI continuation.
 */
export function normalizeLLMPositions(
  llmRemi: RemiEvent[],
  beatsPerBar: number,
  stepsPerBeat: number
): RemiEvent[] {
  const maxPositionPerBar = beatsPerBar * stepsPerBeat;

  const normalized: RemiEvent[] = [];
  let currentBar = 0;

  for (const event of llmRemi) {
    if (event.type === 'Bar') {
      currentBar = event.value;
      normalized.push(event); // Bars are fine, push as is
      continue;
    }

    if (event.type === 'Position') {
      const absolutePosition = event.value;

      // Compute new Bar and Position
      const barOffset = Math.floor(absolutePosition / maxPositionPerBar);
      const normalizedPosition = absolutePosition % maxPositionPerBar;

      const newBar = currentBar + barOffset;

      // Emit normalized Bar if it's different than currentBar
      if (normalized.length === 0 || normalized[normalized.length - 1]?.type !== 'Bar' || normalized[normalized.length - 1].value !== newBar) {
        normalized.push({ type: 'Bar', value: newBar });
      }

      normalized.push({ type: 'Position', value: normalizedPosition });
    } else {
      // Pitch, Duration, Velocity events stay untouched
      normalized.push(event);
    }
  }

  return normalized;
}
