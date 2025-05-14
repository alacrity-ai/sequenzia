// src/shared/utils/musical/remiUtils.ts

import type { Note } from '@/shared/interfaces/Note.js';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions.js';
import { devLog } from '@/shared/state/devMode.js';


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
    quantizeDurations = true,
    ignoreVelocity = false
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

    if (!ignoreVelocity) {
      const velocity = note.velocity ?? 100;
      tokens.push({ type: 'Velocity', value: velocity });
    }
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
    quantizeDurations = true,
    ignoreVelocity = false
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

        const isValidNumber = (val: unknown): val is number =>
          typeof val === 'number' && !Number.isNaN(val) && Number.isFinite(val);

        if (
          !durationToken || durationToken.type !== 'Duration' ||
          !isValidNumber(durationToken.value)
        ) {
          devLog(`REMI decode: Missing or invalid Duration token after Pitch at index ${i}`, {
            pitchToken: token,
            durationToken
          }, 'warn');
          continue;
        }

        let velocity = 100; // default if ignoreVelocity is true

        if (!ignoreVelocity) {
          const velocityToken = tokens[i + 2];

          if (
            !velocityToken || velocityToken.type !== 'Velocity' ||
            !isValidNumber(velocityToken.value)
          ) {
            devLog(`REMI decode: Missing or invalid Velocity token after Duration at index ${i}`, {
              pitchToken: token,
              velocityToken
            }, 'warn');
            continue;
          }

          velocity = velocityToken.value;
        }

        const start = currentBar * beatsPerBar + currentPosition / stepsPerBeat;
        const decodedDuration = quantizeDurations
          ? durationToken.value / stepsPerBeat
          : durationToken.value;

        notes.push({
          pitch: token.value,
          start,
          duration: decodedDuration,
          velocity
        });

        hasValidPosition = false;
        i += ignoreVelocity ? 1 : 2; // skip tokens accordingly
        break;
      }

      default:
        // Silent skip of unrecognized token types
        break;
    }
  }

  return notes;
}
