// sequencer/mini-contour.js
import { pitchToMidi } from "./grid/geometry.js";
import { getTotalBeats } from "../helpers.js";

const TRACK_COLORS = [
  '#ff006e', '#3a86ff', '#ffbe0b', '#8338ec', '#06d6a0',
  '#ef476f', '#118ab2', '#ffd166', '#073b4c', '#8ac926'
];

export function drawMiniContour(canvas, notes, config, colorIndex = 0) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const color = TRACK_COLORS[colorIndex % TRACK_COLORS.length];
  ctx.fillStyle = color;

  const totalBeats = getTotalBeats(config);
  const minMidi = pitchToMidi(config.noteRange[0]);
  const maxMidi = pitchToMidi(config.noteRange[1]);
  const pitchRange = maxMidi - minMidi || 1;
  const blockH = Math.max(2, H / pitchRange);

  for (const note of notes) {
    const x = (note.start / totalBeats) * W;
    const w = Math.max(1, (note.duration / totalBeats) * W);
    const midi = pitchToMidi(note.pitch);
    const norm = (midi - minMidi) / pitchRange;
    const y = H - norm * H - blockH / 2;
    ctx.fillRect(x, y, w, blockH);
  }
}

export function drawGlobalMiniContour(canvas, sequencers) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  sequencers.forEach((seq, index) => {
    const notes = seq.notes;
    const config = seq.config;
    if (!notes?.length) return;

    const totalBeats = getTotalBeats(config);
    const color = TRACK_COLORS[index % TRACK_COLORS.length];
    ctx.fillStyle = color;

    const minMidi = pitchToMidi(config.noteRange[0]);
    const maxMidi = pitchToMidi(config.noteRange[1]);
    const pitchRange = maxMidi - minMidi || 1;
    const blockH = Math.max(2, H / pitchRange);

    for (const note of notes) {
      const x = (note.start / totalBeats) * W;
      const w = Math.max(1, (note.duration / totalBeats) * W);
      const midi = pitchToMidi(note.pitch);
      const norm = (midi - minMidi) / pitchRange;
      const y = H - norm * H - blockH / 2;
      ctx.fillRect(x, y, w, blockH);
    }
  });
}

export function refreshGlobalMiniContour(globalMiniCanvas, sequencers) {
  drawGlobalMiniContour(globalMiniCanvas, sequencers);
}
