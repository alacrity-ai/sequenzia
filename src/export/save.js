// save.js — responsible for exporting single-sequence or full session
import Sequencer from '../sequencer/sequencer.js';

export function exportToJSON(notes, config) {
  // old single-track export (kept for backwards compatibility)
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    config: {
      bpm: config.bpm,
      snapResolution: config.snapResolution,
      currentDuration: config.currentDuration,
      noteRange: config.noteRange,
      totalBeats: config.totalBeats,
      beatsPerMeasure: config.beatsPerMeasure,
      totalMeasures: config.totalMeasures
    },
    notes: notes.map(n => ({ pitch: n.pitch, start: n.start, duration: n.duration }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  return { url: URL.createObjectURL(blob), filename: `sequence-${Date.now()}.json` };
}

export function exportSessionToJSON(tracks) {
  if (!tracks.length) throw new Error("No tracks to export.");

  const bpm = tracks[0].config.bpm;
  const beatsPerMeasure = tracks[0].config.beatsPerMeasure;
  const totalMeasures = tracks[0].config.totalMeasures;

  const payload = {
    v: 3,
    t: new Date().toISOString(),
    c: {
      b: bpm,
      bpm: beatsPerMeasure,
      tm: totalMeasures
    },
    i: tracks.map(t => t.instrument || 'fluidr3-gm/acoustic_grand_piano'),
    tr: tracks.map(({ notes }) => ({
      n: notes.map(n => [n.pitch, n.start, n.duration])
    }))
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  return {
    url: URL.createObjectURL(blob),
    filename: `session-${Date.now()}.json`
  };
}


// Placeholder for future export options
export function exportToMIDI(notes, config) {
  throw new Error("MIDI export not implemented yet.");
}

export async function exportSessionToWAV(tracks) {
  if (!tracks.length) return;

  const bpm          = tracks[0].config.bpm;
  const beatDuration = 60 / bpm;

  const totalSeconds = Math.max(
    ...tracks.flatMap(t =>
      t.notes.map(n => (n.start + n.duration) * beatDuration + 0.2)
    )
  );

  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(
    2,
    Math.ceil(sampleRate * totalSeconds),
    sampleRate
  );
  for (const state of tracks) {
    const instrumentName = state.instrument || 'fluidr3-gm/acoustic_grand_piano';
    const seq = new Sequencer(null, state.config, offlineCtx, offlineCtx.destination, instrumentName);
    seq.setState(state);
    await seq.exportToOffline();
  }
  

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  const url = URL.createObjectURL(wavBlob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${Date.now()}.wav`;
  a.click();
  URL.revokeObjectURL(url);
}


function audioBufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels * 2;
  const result = new DataView(new ArrayBuffer(44 + length));

  const writeString = (offset, str) => {
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
