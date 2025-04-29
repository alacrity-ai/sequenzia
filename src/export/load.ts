// src/export/load.ts

import { TrackData } from '../sequencer/interfaces/Track.js';
import { GlobalConfig } from '../userconfig/interfaces/GlobalConfig.js';
import { Session } from '../sequencer/interfaces/Session.js';
import { Note } from '../sequencer/interfaces/Note.js';
import { TrackTuple, NoteTuple } from '../sequencer/interfaces/TrackTuple.js';

/**
 * Imports a session from a JSON file.
 * @param file - The JSON file to load.
 * @returns A promise that resolves with the session data.
 */
export async function importSessionFromJSON(file: File): Promise<Session> {
  const text = await file.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON format.");
  }

  if (!Array.isArray(data.tr)) {
    throw new Error("Missing or invalid `tr` (tracks) array.");
  }

  // Define the global configuration
  const globalConfig: GlobalConfig = {
    bpm: data.c?.b ?? 120,
    beatsPerMeasure: data.c?.bpm ?? 4,
    totalMeasures: data.c?.tm ?? 8,
  };

  // Map instrument names
  const instrumentNames = Array.isArray(data.i) ? data.i : [];

  // Map the tracks with explicit typing for track and idx
  const tracks: TrackData[] = data.tr.map((track: TrackTuple, idx: number) => {
    if (!Array.isArray(track.n)) {
      throw new Error(`Track ${idx} missing \`n\` (notes) array.`);
    }

    // Explicit type cast from NoteTuple[] to Note[]
    const notes: Note[] = (track.n as NoteTuple[]).map(([pitch, start, duration]: NoteTuple) => ({
      pitch,
      start,
      duration
    }));

    const instrument = instrumentNames[idx] || 'sf2/fluidr3-gm/acoustic_grand_piano';

    return { notes, instrument, config: {} }; // Assuming config is an empty object, you may need to adjust if it has actual values.
  });

  return { globalConfig, tracks };
}
