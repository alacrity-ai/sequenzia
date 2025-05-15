// src/sequencer/matrix/utils/concertBeatsToBarPosition.ts

/**
 * Converts a beat position into REMI Bar and Position values.
 *
 * @param beat - The absolute beat position.
 * @param beatsPerBar - Beats per bar (from REMI settings).
 * @param stepsPerBeat - Steps per beat (from REMI settings).
 * @returns Object with bar and position values.
 */
export function convertBeatToBarPosition(
  beat: number,
  beatsPerBar: number,
  stepsPerBeat: number
): { bar: number; position: number } {
  const bar = Math.floor(beat / beatsPerBar);
  const position = Math.round((beat % beatsPerBar) * stepsPerBeat);

  return { bar, position };
}
