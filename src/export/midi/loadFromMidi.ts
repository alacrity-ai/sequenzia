// src/export/midi/loadFromMidi.ts

import { Midi } from '@tonejs/midi';
import { Session } from '../../sequencer/interfaces/Session.js';
import { TrackData } from '../../sequencer/interfaces/Track.js';
import { GlobalConfig } from '../../userconfig/interfaces/GlobalConfig.js';
import { Note } from '../../sequencer/interfaces/Note.js';
import { GM_INSTRUMENTS } from './instrumentMapping.js';
import { getDrumMachineInstruments } from '../../sounds/loaders/sf2-loader.js';

/**
 * Imports a session from a MIDI file.
 * @param file - The MIDI file to load.
 * @returns A promise that resolves with the session data.
 */
export async function importSessionFromMIDI(file: File): Promise<Session> {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);

  // Build globalConfig
  const tempoEvent = midi.header.tempos[0];
  const timeSigEvent = midi.header.timeSignatures[0];

  const bpm = tempoEvent?.bpm ?? 120;
  const beatsPerMeasure = timeSigEvent?.timeSignature?.[0] ?? 4;

  // Dynamically estimate total measures based on the latest note
  const latestNoteEnd = Math.max(
    0,
    ...midi.tracks.flatMap(track => 
      track.notes.map(note => note.time + note.duration)
    )
  );
  const totalBeats = latestNoteEnd * (bpm / 60);
  const estimatedTotalMeasures = Math.ceil(totalBeats / beatsPerMeasure) || 8; // fallback 8 if no notes

  const globalConfig: GlobalConfig = {
    bpm,
    beatsPerMeasure,
    totalMeasures: estimatedTotalMeasures,
  };

  const availableDrums = await getDrumMachineInstruments();
  console.log(`[MIDI] Available drum machines: ${availableDrums.join(', ')}`);
  const drumKit = availableDrums.includes('LM-2') ? 'LM-2' : availableDrums[0] ?? 'TR-808'; // ✅ safe fallback

  const tracks: TrackData[] = midi.tracks.map((track) => {
    const notes: Note[] = track.notes.map((n) => ({
      pitch: n.name, // e.g., "C4", "G#3"
      start: n.time * (bpm / 60),
      duration: n.duration * (bpm / 60),
    }));
  
    let instrumentProgram = track.instrument.number; // try explicit ProgramChange first
    if (instrumentProgram === undefined || instrumentProgram === 0) {
      // No explicit ProgramChange? Fallback to guessing based on channel
      if (track.channel === 9) {
        instrumentProgram = 0; // drums are typically program 0 but *played as drums*
      } else {
        instrumentProgram = track.channel % 128; // safe fallback
      }
    }
  
    const gmInstrumentName = GM_INSTRUMENTS[instrumentProgram] || 'acoustic_grand_piano';
    
    // Special handling for channel 9 (drums): remap to a known drum machine if you want
    const fullInstrumentName = track.channel === 9
      ? `sf2/drummachines/${drumKit}` // generic default drums
      : `sf2/fluidr3-gm/${gmInstrumentName}`;
  
    return {
      notes,
      instrument: fullInstrumentName,
      config: {}, // Optional
    };
  });
  

  return { globalConfig, tracks };
}
