// sequencer/mini-contour.js
import { pitchToMidi } from "./grid/helpers/geometry.js";
import { getTotalBeats } from "./transport.js";
import { TRACK_COLORS } from "./grid/helpers/sequencerColors.js";


export function drawMiniContour(canvas, notes, config, colorIndex = 0) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!notes.length) return;

  const color = TRACK_COLORS[colorIndex % TRACK_COLORS.length];
  ctx.fillStyle = color;

  const totalBeats = getTotalBeats();

  // 🎯 Scan actual used notes
  const midiNotes = notes.map(note => pitchToMidi(note.pitch));
  const minUsedMidi = Math.min(...midiNotes);
  const maxUsedMidi = Math.max(...midiNotes);

  // 🎯 Fallback if somehow identical
  const pitchRange = Math.max(1, maxUsedMidi - minUsedMidi);

  const blockH = Math.max(2, H / pitchRange);

  for (const note of notes) {
    const x = (note.start / totalBeats) * W;
    const w = Math.max(1, (note.duration / totalBeats) * W);

    const midi = pitchToMidi(note.pitch);
    const norm = (midi - minUsedMidi) / pitchRange; // ⬅️ relative to used range
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

    const totalBeats = getTotalBeats();
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
