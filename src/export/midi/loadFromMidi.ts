// src/export/midi/loadFromMidi.ts

import { Midi } from '@tonejs/midi';
import { Session } from '@/components/sequencer/interfaces/Session.js';
import { TrackData } from '@/components/sequencer/interfaces/Track.js';
import type { SongConfig } from '@/shared/interfaces/SongConfig.js';
import { Note } from '@/shared/interfaces/Note.js';
import { GM_INSTRUMENTS } from '@/export/midi/instrumentMapping.js';
import { getDrumMachineInstruments } from '@/sounds/loaders/sf2-loader.js';
import { getWebAudioFontDrumKit } from '@/sounds/loaders/catalogues/webaudiofont-catalogue.js';

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
  
    const globalConfig: SongConfig = {
      bpm,
      beatsPerMeasure,
      totalMeasures: estimatedTotalMeasures,
      songKey: 'CM'
    };
  
    const availableSf2Drums = await getDrumMachineInstruments();
  
    const tracks: TrackData[] = midi.tracks.map((track) => {
      const notes: Note[] = track.notes.map((n) => ({
        pitch: n.name,
        start: n.time * (bpm / 60),
        duration: n.duration * (bpm / 60),
        velocity: Math.max(1, Math.min(127, Math.round(n.velocity * 127)))
      }));
  
      let instrumentProgram = track.instrument.number;
      if (instrumentProgram === undefined || instrumentProgram === 0) {
        instrumentProgram = track.channel === 9 ? 0 : track.channel % 128;
      }
  
      // 🟣 Get volume and pan control changes
      const volumeEvents = track.controlChanges[7] || [];
      const panEvents = track.controlChanges[10] || [];
  
      const volume = volumeEvents.length > 0 ? volumeEvents[0].value : undefined; // 0.0–1.0
      const pan = panEvents.length > 0 ? (panEvents[0].value * 2 - 1) : undefined; // 0.0–1.0 → -1.0 to 1.0
  
      let fullInstrumentName: string;
  
      if (track.channel === 9) {
        // Try to infer WebAudioFont drum kit first
        const inferred = getWebAudioFontDrumKit(instrumentProgram);
        if (inferred) {
          fullInstrumentName = `webaudiofont/${inferred.library}/${inferred.displayName}`;
        } else {
          // Fallback to SF2 drum machine
          const sf2Fallback = availableSf2Drums.includes('LM-2') ? 'LM-2' : availableSf2Drums[0] ?? 'TR-808';
          fullInstrumentName = `sf2/drummachines/${sf2Fallback}`;
        }
      } else {
        const gmInstrumentName = GM_INSTRUMENTS[instrumentProgram] || 'acoustic_grand_piano';
        fullInstrumentName = `sf2/fluidr3-gm/${gmInstrumentName}`;
      }
  
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