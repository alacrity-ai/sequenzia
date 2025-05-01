// src/export/midi/exportToMidi.ts

import { AppState } from '../../appState/interfaces/AppState.js';
import { Midi } from '@tonejs/midi';
import { pitchToMidi } from '../../sounds/audio/pitch-utils.js';
import { mapInstrumentNameToProgramNumber } from './instrumentMapping.js';

/**
 * Exports the current AppState session to a downloadable MIDI file.
 */
export async function exportSessionToMIDI(appState: AppState): Promise<{ url: string, filename: string }> {
    if (!appState.sequencers.length) {
      throw new Error('No tracks to export.');
    }
  
    const midi = new Midi();
  
    midi.header.setTempo(appState.tempo);
    midi.header.timeSignatures.push({
      ticks: 0,
      timeSignature: appState.timeSignature,
    });
  
    for (const [trackIndex, seq] of appState.sequencers.entries()) {
      const track = midi.addTrack();
  
      const isDrumTrack = seq.instrument.toLowerCase().includes('drum');
      track.channel = isDrumTrack ? 9 : trackIndex % 16;
  
      const programNumber = mapInstrumentNameToProgramNumber(seq.instrument);
      track.instrument.number = programNumber;
  
      // 🟣 Add volume control (CC 7)
      if (typeof seq.volume === 'number') {
        track.addCC({
          number: 7,
          time: 0,
          value: Math.max(0, Math.min(1, seq.volume)), // 0.0–1.0
        });
      }
  
      // 🟣 Add pan control (CC 10)
      if (typeof seq.pan === 'number') {
        // Convert -1..1 to 0..1
        const panNormalized = (seq.pan + 1) / 2;
        track.addCC({
          number: 10,
          time: 0,
          value: Math.max(0, Math.min(1, panNormalized)), // 0.0–1.0
        });
      }
  
      for (const note of seq.notes) {
        const midiNumber = pitchToMidi(note.pitch);
        const velocity = Math.max(0.01, Math.min(1, (note.velocity ?? 100) / 127));
        if (midiNumber === null) continue;
  
        const startSeconds = beatsToSeconds(note.start, appState.tempo);
        const durationSeconds = beatsToSeconds(note.duration, appState.tempo);
  
        track.addNote({
          midi: midiNumber,
          time: startSeconds,
          duration: durationSeconds,
          velocity: velocity, // Normalized from 0-1
        });
      }
    }
  
    const midiBlob = new Blob([midi.toArray()], { type: 'audio/midi' });
    const url = URL.createObjectURL(midiBlob);
  
    return {
      url,
      filename: `session-${Date.now()}.mid`,
    };
  }

/**
 * Converts beats to seconds based on tempo.
 */
function beatsToSeconds(beats: number, bpm: number): number {
  return (60 / bpm) * beats;
}
