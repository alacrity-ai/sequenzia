// src/shared/llm/tasks/remi/normalizeRemiPositions.ts

import type { RemiEvent } from '@/shared/interfaces/RemiEvent';

/**
 * Normalizes Position overflow in LLM REMI output by rolling Positions into correct Bar numbers.
 * 
 * @param remiEvents The raw REMI continuation from the LLM.
 * @param beatsPerBar Beats per bar (from remiSettings).
 * @param stepsPerBeat Steps per beat (from remiSettings).
 * @returns Normalized REMI continuation with proper Bar and Position values.
 */
export function normalizeRemiPositions(
  remiEvents: RemiEvent[],
  beatsPerBar: number,
  stepsPerBeat: number
): RemiEvent[] {
  const maxPositionPerBar = beatsPerBar * stepsPerBeat;

  const normalized: RemiEvent[] = [];
  let currentBar = 0;

  for (const event of remiEvents) {
    if (event.type === 'Bar') {
      currentBar = event.value;
      normalized.push(event); // Bars are fine as is
      continue;
    }

    if (event.type === 'Position') {
      const absolutePosition = event.value;

      const barOffset = Math.floor(absolutePosition / maxPositionPerBar);
      const normalizedPosition = absolutePosition % maxPositionPerBar;

      const newBar = currentBar + barOffset;

      // Only emit a new Bar if it differs from the last emitted Bar
      const lastEvent = normalized[normalized.length - 1];
      if (!lastEvent || lastEvent.type !== 'Bar' || lastEvent.value !== newBar) {
        normalized.push({ type: 'Bar', value: newBar });
      }

      normalized.push({ type: 'Position', value: normalizedPosition });
    } else {
      // Pitch, Duration, Velocity events pass through untouched
      normalized.push(event);
    }
  }

  return normalized;
}
