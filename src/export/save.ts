// src/export/save.ts

import { Session } from '@/components/sequencer/interfaces/Session.js';
import { getTempo } from '@/shared/playback/transportService.js';
import { AppState } from '@/appState/interfaces/AppState.js';
import { showLoadingModal, hideLoadingModal } from '@/components/globalPopups/helpers/loadingModal.js';
import { createExportSequencer, resetExportSequencerIds } from '@/components/sequencer/factories/exportSequencerFactory.js';

let globalLoading: boolean = false;

/**
 * Exports the complete session to JSON format (current format - v3).
 * @param {AppState} appState - The app state containing sequencer data
 * @throws {Error} If sequencers array is empty
 * @returns {{url: string, filename: string}} Object containing the blob URL and suggested filename
 * 
 * @example
 * // Format specification v3:
 * {
 *   v: 3,                     // version
 *   t: "2023-...",            // timestamp
 *   c: {                      // configuration
 *     b: 120,                 // bpm
 *     bpm: 4,                 // beats per measure
 *     tm: 8                   // total measures
 *     sk: 'CM'                 // song key
 *   },
 *   i: ["piano", "drums"],    // instruments (matches track order)
 *   vlm: [90.0, 80.0, 100.0], // volume, matches track order
 *   pan: [-1.0, 0.0, 1.0],    // pan matches track order
 *   tr: [{                    // tracks
 *     n: [[pitch, start, duration, velocity], ...]  // notes
 *   }, ...]
 * }
 */
export function exportSessionToJSON(appState: AppState): { url: string, filename: string } {
  if (!appState.sequencers.length) throw new Error("No tracks to export.");

  const bpm = appState.tempo;
  const beatsPerMeasure = appState.timeSignature[0];
  const totalMeasures = appState.totalMeasures;
  const songKey = appState.songKey;

  const payload = {
    v: 3,
    t: new Date().toISOString(),
    c: {
      b: bpm,
      bpm: beatsPerMeasure,
      tm: totalMeasures,
      sk: songKey
    },
    i: appState.sequencers.map(s => s.instrument || 'sf2/fluidr3-gm/acoustic_grand_piano'),
    vlm: appState.sequencers.map(s => s.volume ?? (100 / 127)), // Default ≈ 0.787
    pan: appState.sequencers.map(s => s.pan ?? 0.0),
    tr: appState.sequencers.map(s => ({
      n: s.notes.map(n => [n.pitch, n.start, n.duration, n.velocity ?? 100])
    }))
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  return {
    url: URL.createObjectURL(blob),
    filename: `session-${Date.now()}.json`
  };
}

// Exports using workers: Experimental
export async function exportSessionToWAVWorkers(session: Session): Promise<void> {
  const bpm = getTempo();
  const beatDuration = 60 / bpm;
  const sampleRate = 44100;

  const totalSeconds = Math.max(
    ...session.tracks.flatMap(t =>
      t.notes.map(n => (n.start + n.duration) * beatDuration + 0.2)
    )
  );

  // Dynamically import main-thread renderer
  const { renderTrackInMainThread } = await import('./wav/renderTrackInMainThread.js');

  const bufferPromises = session.tracks.map(track =>
    renderTrackInMainThread(
      track,
      track.instrument || 'sf2/fluidr3-gm/acoustic_grand_piano',
      bpm,
      sampleRate,
      totalSeconds
    )
  );

  const trackBuffers = await Promise.all(bufferPromises);

  const finalCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalSeconds), sampleRate);

  for (const buffer of trackBuffers) {
    const src = finalCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(finalCtx.destination);
    src.start();
  }

  const mixed = await finalCtx.startRendering();
  const wavBlob = audioBufferToWavBlob(mixed);

  const url = URL.createObjectURL(wavBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${Date.now()}.wav`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportSessionToWAV(
  session: Session,
  options: { sampleRate: number; includePan: boolean } = { sampleRate: 44100, includePan: true }
): Promise<void> {
  if (!session.tracks || session.tracks.length === 0) {
    throw new Error("No tracks to export.");
  }

  const sampleRate = options.sampleRate;
  const numChannels = options.includePan ? 2 : 1;

  const abortController = new AbortController();
  let aborted = false;

  showLoadingModal(
    "Exporting Session",
    "Rendering your session offline...",
    () => {
      aborted = true;
      abortController.abort();
    },
    true
  );

  try {
    const bpm = getTempo();
    const beatDuration = 60 / bpm;

    const totalSeconds = Math.max(
      ...session.tracks.flatMap(t =>
        t.notes.map(n => (n.start + n.duration) * beatDuration + 0.2)
      )
    );

    const offlineCtx = new OfflineAudioContext(
      numChannels,
      Math.ceil(sampleRate * totalSeconds),
      sampleRate
    );

    // Reset export sequencer id counter for this export pass
    resetExportSequencerIds();

    for (const track of session.tracks) {
      if (aborted) return;

      const seq = createExportSequencer(offlineCtx, track);

      await seq.exportToOffline(abortController.signal, track.notes);

      if (aborted) return;
    }

    if (aborted) return;

    showLoadingModal("Rendering Audio", "Rendering audio buffer…", undefined, true);
    const renderedBuffer = await offlineCtx.startRendering();

    showLoadingModal("Converting to WAV", "Converting to WAV format…", undefined, true);
    const wavBlob = audioBufferToWavBlob(renderedBuffer);

    showLoadingModal("Downloading WAV", "Please wait...", undefined, true);
    const url = URL.createObjectURL(wavBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${Date.now()}.wav`;
    a.click();
    URL.revokeObjectURL(url);

  } catch (e) {
    if (aborted) {
      console.warn("Export operation was cancelled by the user.");
    } else {
      console.error("Error during export:", e);
    }
  } finally {
    hideLoadingModal(true);
  }
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

export function isGlobalLoading(): boolean {
  return globalLoading;
}