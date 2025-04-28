// src/export/midi/exportToMidi.ts

import { AppState } from '../../appState/interfaces/AppState.js';
import { Midi } from '@tonejs/midi';
import { pitchToMidi } from '../../audio/pitch-utils.js';
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
    timeSignature: appState.timeSignature, // Already [numerator, denominator]
  });  

  for (const [trackIndex, seq] of appState.sequencers.entries()) {
    const track = midi.addTrack();
    
    const isDrumTrack = seq.instrument.toLowerCase().includes('drum');
    track.channel = isDrumTrack ? 9 : trackIndex % 16; // drums → channel 10 (zero-indexed = 9)

    const programNumber = mapInstrumentNameToProgramNumber(seq.instrument);
    track.instrument.number = programNumber;

    for (const note of seq.notes) {
      const midiNumber = pitchToMidi(note.pitch);
      if (midiNumber === null) continue; // defensive skip

      const startSeconds = beatsToSeconds(note.start, appState.tempo);
      const durationSeconds = beatsToSeconds(note.duration, appState.tempo);

      track.addNote({
        midi: midiNumber,
        time: startSeconds,
        duration: durationSeconds,
        velocity: 0.8, // Default velocity for now (future: make this configurable)
      });
    }
  }

  const midiBlob = new Blob([midi.toArray()], { type: 'audio/midi' });
  const url = URL.createObjectURL(midiBlob);

  return {
    url,
    filename: `session-${Date.now()}.mid`
  };
}

/**
 * Converts beats to seconds based on tempo.
 */
function beatsToSeconds(beats: number, bpm: number): number {
  return (60 / bpm) * beats;
}
