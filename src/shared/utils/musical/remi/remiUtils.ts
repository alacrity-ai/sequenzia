// src/shared/utils/musical/remiUtils.ts

import type { Note } from '../../../interfaces/Note.js';
import type { RemiEvent } from '../../../interfaces/RemiEvent.js';
import type { RemiEncodeOptions } from '../../../interfaces/RemiEncoderOptions.js';
import { devLog } from '../../../state/devMode.js';


/**
 * Converts a list of notes into a REMI-like token sequence
 * Assumes input notes are sorted by start time.
 */
export function remiEncode(
  notes: Note[],
  options: RemiEncodeOptions = {}
): RemiEvent[] {
  const {
    beatsPerBar = 4,
    stepsPerBeat = 4,
    quantizeDurations = true
  } = options;

  const tokens: RemiEvent[] = [];

  const sorted = [...notes].sort((a, b) => a.start - b.start);
  let currentBar = -1;

  for (const note of sorted) {
    const bar = Math.floor(note.start / beatsPerBar);
    const beat = note.start % beatsPerBar;
    const position = Math.round(beat * stepsPerBeat); // e.g., beat 1.25 → position 5 if stepsPerBeat=4

    // Emit Bar token if entering a new bar
    if (bar !== currentBar) {
      tokens.push({ type: 'Bar', value: bar });
      currentBar = bar;
    }

    tokens.push({ type: 'Position', value: position });
    tokens.push({ type: 'Pitch', value: note.pitch });

    const quantizedDuration = quantizeDurations
      ? Math.max(1, Math.round(note.duration * stepsPerBeat))
      : note.duration;

    tokens.push({ type: 'Duration', value: quantizedDuration });

    const velocity = note.velocity ?? 100;
    tokens.push({ type: 'Velocity', value: velocity });
  }

  return tokens;
}

export function remiDecode(
  tokens: RemiEvent[],
  options: RemiEncodeOptions = {}
): Note[] {
  const {
    beatsPerBar = 4,
    stepsPerBeat = 4,
    quantizeDurations = true
  } = options;

  let currentBar = 0;
  let currentPosition = 0;
  let hasValidPosition = false;

  const notes: Note[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'Bar':
        currentBar = token.value;
        break;

      case 'Position':
        currentPosition = token.value;
        hasValidPosition = true;
        break;

      case 'Pitch': {
        if (!hasValidPosition) {
          devLog(`REMI decode: Pitch token at index ${i} has no preceding Position`, token, 'warn');
          continue;
        }

        const durationToken = tokens[i + 1];
        const velocityToken = tokens[i + 2];

        const duration = durationToken?.value;
        const velocity = velocityToken?.value;

        const isValidNumber = (val: unknown): val is number =>
          typeof val === 'number' && !Number.isNaN(val) && Number.isFinite(val);

        if (
          !durationToken || durationToken.type !== 'Duration' ||
          !velocityToken || velocityToken.type !== 'Velocity' ||
          !isValidNumber(duration) ||
          !isValidNumber(velocity)
        ) {
          devLog(`REMI decode: Malformed token triplet at index ${i}`, {
            pitchToken: token,
            durationToken,
            velocityToken
          }, 'warn');
          continue;
        }

        const start = currentBar * beatsPerBar + currentPosition / stepsPerBeat;
        const decodedDuration = quantizeDurations
          ? duration / stepsPerBeat
          : duration;

        notes.push({
          pitch: token.value,
          start,
          duration: decodedDuration,
          velocity
        });

        hasValidPosition = false;
        i += 2;
        break;
      }

      default:
        // Silent skip of unrecognized token types
        break;
    }
  }

  return notes;
}
