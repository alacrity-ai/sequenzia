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
  
    const tempoEvent = midi.header.tempos[0];
    const timeSigEvent = midi.header.timeSignatures[0];
  
    const bpm = tempoEvent?.bpm ?? 120;
    const beatsPerMeasure = timeSigEvent?.timeSignature?.[0] ?? 4;
  
    const latestNoteEnd = Math.max(
      0,
      ...midi.tracks.flatMap(track => 
        track.notes.map(note => note.time + note.duration)
      )
    );
    const totalBeats = latestNoteEnd * (bpm / 60);
    const estimatedTotalMeasures = Math.ceil(totalBeats / beatsPerMeasure) || 8;
  
    const globalConfig: GlobalConfig = {
      bpm,
      beatsPerMeasure,
      totalMeasures: estimatedTotalMeasures,
    };
  
    const availableDrums = await getDrumMachineInstruments();
    const drumKit = availableDrums.includes('LM-2') ? 'LM-2' : availableDrums[0] ?? 'TR-808';
  
    const tracks: TrackData[] = midi.tracks.map((track) => {
      const notes: Note[] = track.notes.map((n) => ({
        pitch: n.name,
        start: n.time * (bpm / 60),
        duration: n.duration * (bpm / 60),
      }));
  
      let instrumentProgram = track.instrument.number;
      if (instrumentProgram === undefined || instrumentProgram === 0) {
        instrumentProgram = track.channel === 9 ? 0 : track.channel % 128;
      }
  
      const gmInstrumentName = GM_INSTRUMENTS[instrumentProgram] || 'acoustic_grand_piano';
      const fullInstrumentName = track.channel === 9
        ? `sf2/drummachines/${drumKit}`
        : `sf2/fluidr3-gm/${gmInstrumentName}`;
  
      // 🟣 Get volume and pan control changes
      const volumeEvents = track.controlChanges[7] || [];
      const panEvents = track.controlChanges[10] || [];
  
      const volume = volumeEvents.length > 0 ? volumeEvents[0].value : undefined; // 0.0–1.0
      const pan = panEvents.length > 0 ? (panEvents[0].value * 2 - 1) : undefined; // 0.0–1.0 → -1.0 to 1.0
  
      return {
        notes,
        instrument: fullInstrumentName,
        volume,
        pan,
        config: {},
      };
    });
  
    return { globalConfig, tracks };
  }
  