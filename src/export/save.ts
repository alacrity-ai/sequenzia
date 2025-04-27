// src/export/save.ts

import { Session } from '../sequencer/interfaces/Session.js';
import Sequencer from '../sequencer/sequencer.js';
import { getTempo, getTimeSignature, getTotalMeasures } from '../sequencer/transport.js';
import { AppState } from '../appState/interfaces/AppState.js';


/**
 * Exports the complete session to JSON format (current format - v3).
 * @param {AppState} appState - The app state containing sequencer data
 * @throws {Error} If sequencers array is empty
 * @returns {{url: string, filename: string}} Object containing the blob URL and suggested filename
 * 
 * @example
 * // Format specification v3:
 * {
 *   v: 3,                    // version
 *   t: "2023-...",          // timestamp
 *   c: {                     // configuration
 *     b: 120,               // bpm
 *     bpm: 4,               // beats per measure
 *     tm: 8                 // total measures
 *   },
 *   i: ["piano", "drums"],  // instruments
 *   tr: [{                  // tracks
 *     n: [[pitch, start, duration], ...]  // notes
 *   }, ...]
 * }
 */
export function exportSessionToJSON(appState: AppState): { url: string, filename: string } {
  if (!appState.sequencers.length) throw new Error("No tracks to export.");

  const bpm = appState.tempo;
  const beatsPerMeasure = appState.timeSignature[0];
  const totalMeasures = appState.totalMeasures;

  const payload = {
    v: 3,
    t: new Date().toISOString(),
    c: {
      b: bpm,
      bpm: beatsPerMeasure,
      tm: totalMeasures
    },
    i: appState.sequencers.map(s => s.instrument || 'fluidr3-gm/acoustic_grand_piano'),
    tr: appState.sequencers.map(s => ({
      n: s.notes.map(n => [n.pitch, n.start, n.duration])
    }))
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  return {
    url: URL.createObjectURL(blob),
    filename: `session-${Date.now()}.json`
  };
}


/**
 * Exports the complete session to WAV format.
 * @param {Session} session - The session object containing tracks
 * @returns {Promise<void>} Resolves when the WAV file has been generated and download triggered
 * @description Renders all tracks to an audio buffer using Web Audio API's OfflineAudioContext,
 *             then converts to WAV format and triggers download
 */
export async function exportSessionToWAV(session: Session): Promise<void> {
  // Check if the session has tracks
  if (!session.tracks || session.tracks.length === 0) {
    throw new Error("No tracks to export.");
  }

  const bpm = getTempo();
  const beatDuration = 60 / bpm;

  // Calculate the total duration of the session in seconds
  const totalSeconds = Math.max(
    ...session.tracks.flatMap(t =>
      t.notes.map(n => (n.start + n.duration) * beatDuration + 0.2)
    )
  );

  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(
    2, // Two channels (stereo)
    Math.ceil(sampleRate * totalSeconds),
    sampleRate
  );

  // Process each track
  for (const state of session.tracks) {
    const instrumentName = state.instrument || 'fluidr3-gm/acoustic_grand_piano';
    // @ts-ignore | Fix this after refactoring Sequencer to ts
    const seq = new Sequencer(null, state.config, offlineCtx, offlineCtx.destination, instrumentName);
    seq.setState(state);
    await seq.exportToOffline();
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  const url = URL.createObjectURL(wavBlob);

  // Create a download link and trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${Date.now()}.wav`;
  a.click();
  URL.revokeObjectURL(url);
}



function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels * 2;
  const result = new DataView(new ArrayBuffer(44 + length));

  const writeString = (offset: number, str: string): void => {
    for (let i = 0; i < str.length; i++) result.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  result.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  result.setUint32(16, 16, true);
  result.setUint16(20, 1, true);
  result.setUint16(22, numChannels, true);
  result.setUint32(24, buffer.sampleRate, true);
  result.setUint32(28, buffer.sampleRate * numChannels * 2, true);
  result.setUint16(32, numChannels * 2, true);
  result.setUint16(34, 16, true);
  writeString(36, 'data');
  result.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = buffer.getChannelData(ch)[i];
      const clamped = Math.max(-1, Math.min(1, sample));
      result.setInt16(offset, clamped * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([result.buffer], { type: 'audio/wav' });
}
