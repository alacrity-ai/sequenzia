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

  // Build globalConfig
  const globalConfig: GlobalConfig = {
    bpm: data.c?.b ?? 120,
    beatsPerMeasure: data.c?.bpm ?? 4,
    totalMeasures: data.c?.tm ?? 8,
  };

  // Handle optional arrays
  const instrumentNames = Array.isArray(data.i) ? data.i : [];
  const volumes = Array.isArray(data.vlm) ? data.vlm : [];
  const pans = Array.isArray(data.pan) ? data.pan : [];

  // Convert tracks
  const tracks: TrackData[] = data.tr.map((track: TrackTuple, idx: number) => {
    if (!Array.isArray(track.n)) {
      throw new Error(`Track ${idx} missing \`n\` (notes) array.`);
    }

    // Convert notes array
    const notes: Note[] = (track.n as NoteTuple[]).map(([pitch, start, duration]: NoteTuple) => ({
      pitch,
      start,
      duration
    }));

    const instrument = instrumentNames[idx] || 'sf2/fluidr3-gm/acoustic_grand_piano';
    const volume = volumes[idx];
    const pan = pans[idx];

    return {
      notes,
      instrument,
      volume: typeof volume === 'number' ? volume : undefined,
      pan: typeof pan === 'number' ? pan : undefined,
      config: {}
    };
  });

  return { globalConfig, tracks };
}

