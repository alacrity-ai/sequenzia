import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

/**
 * Shifts an LLM continuation so that its first Position event aligns with the desired endBeat.
 *
 * @param remiEvents - The normalized LLM continuation RemiEvents.
 * @param endBeat - The desired starting beat in the song.
 * @param beatsPerBar - Beats per bar (from remiSettings).
 * @param stepsPerBeat - Steps per beat (from remiSettings).
 * @returns Shifted RemiEvents aligned to endBeat.
 */
export function shiftLLMContinuationToEndBeat(
  remiEvents: RemiEvent[],
  endBeat: number,
  beatsPerBar: number,
  stepsPerBeat: number
): RemiEvent[] {
  const maxPositionPerBar = beatsPerBar * stepsPerBeat;

  // Find first Position event to compute alignment delta
  const firstPositionEvent = remiEvents.find(e => e.type === 'Position') as RemiEvent | undefined;
  if (!firstPositionEvent) return remiEvents; // nothing to shift

  // Find the associated Bar for that Position event
  const firstPositionIndex = remiEvents.indexOf(firstPositionEvent);
  const firstBarEvent = [...remiEvents]
    .slice(0, firstPositionIndex + 1)
    .reverse()
    .find(e => e.type === 'Bar') as RemiEvent | undefined;

  const firstBar = (firstBarEvent?.value ?? 0) as number;
  const firstPosition = firstPositionEvent.value as number;

  const firstAbsoluteBeat = firstBar * beatsPerBar + (firstPosition / stepsPerBeat);

  const shiftDeltaBeats = endBeat - firstAbsoluteBeat;

  const shiftedRemiEvents: RemiEvent[] = [];
  let currentBar = 0;

  for (const event of remiEvents) {
    if (event.type === 'Bar') {
      currentBar = event.value as number;
      continue; // Defer Bar re-emission until after Position
    }

    if (event.type === 'Position') {
      const absoluteBeat = currentBar * beatsPerBar + (event.value as number) / stepsPerBeat;

      const shiftedAbsoluteBeat = absoluteBeat + shiftDeltaBeats;

      const newBar = Math.floor(shiftedAbsoluteBeat / beatsPerBar);
      const newPosition = Math.round((shiftedAbsoluteBeat % beatsPerBar) * stepsPerBeat);

      // === Manual reverse scan for last Bar ===
      let lastBarEvent: RemiEvent | undefined = undefined;
      for (let i = shiftedRemiEvents.length - 1; i >= 0; i--) {
        if (shiftedRemiEvents[i].type === 'Bar') {
          lastBarEvent = shiftedRemiEvents[i];
          break;
        }
      }

      // Emit Bar if changed or first note
      if (!lastBarEvent || lastBarEvent.value !== newBar) {
        shiftedRemiEvents.push({ type: 'Bar', value: newBar });
      }

      shiftedRemiEvents.push({ type: 'Position', value: newPosition });
      continue;
    }

    // Pass through Pitch, Duration, Velocity untouched
    shiftedRemiEvents.push(event);
  }

  return shiftedRemiEvents;
}
