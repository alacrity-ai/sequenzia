// sequencer/mini-contour.js
import { pitchToMidi } from "./grid/helpers/geometry.js";
import { TRACK_COLORS } from "./grid/helpers/sequencerColors.js";
import { getTotalBeats, getTimeSignature, getTotalMeasures } from "./transport.js";

export function drawMiniContour(canvas, notes, config, colorIndex = 0) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!notes.length) return;

  const color = TRACK_COLORS[colorIndex % TRACK_COLORS.length];
  ctx.fillStyle = color;

  const totalBeats = getTotalBeats();

  // 🎯 Determine pitch range from actual notes
  const midiNotes = notes.map(note => pitchToMidi(note.pitch));
  let minUsedMidi = Math.min(...midiNotes);
  let maxUsedMidi = Math.max(...midiNotes);
  let pitchRange = Math.max(1, maxUsedMidi - minUsedMidi);
  
  // 🔥 Snap pitch range so that H / pitchRange is integer
  while (H % pitchRange !== 0) {
    maxUsedMidi++; // Expand upwards
    pitchRange = maxUsedMidi - minUsedMidi;
  }
  
  const blockH = H / pitchRange; // perfect, integer

  // 🎼 Draw note contours (snap to integer pixels)
  for (const note of notes) {
    const rawX = (note.start / totalBeats) * W;
    const rawW = (note.duration / totalBeats) * W;
    const midi = pitchToMidi(note.pitch);
    const norm = (midi - minUsedMidi) / pitchRange;
    const rawY = H - norm * H - blockH / 2;

    const x = Math.round(rawX);
    const w = Math.max(1, Math.round(rawW));
    const y = Math.round(rawY);

    ctx.fillRect(x, y, w, blockH);
  }

  // 📏 Draw measure markers (dynamic density, clean + minimal)
  const beatsPerMeasure = getTimeSignature();
  const totalMeasures = getTotalMeasures();

  ctx.save();

  let drawEvery = 1;
  if (totalMeasures > 256) drawEvery = 16;
  else if (totalMeasures > 128) drawEvery = 8;
  else if (totalMeasures > 32)  drawEvery = 4;

  for (let m = 0; m <= totalMeasures; m++) {
    if (m % drawEvery !== 0) continue;

    const beat = m * beatsPerMeasure;
    const rawX = (beat / totalBeats) * W;
    const x = Math.round(rawX) + 0.5;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);

    const strong = drawEvery === 1 || m % (drawEvery * 2) === 0;

    ctx.strokeStyle = strong
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 0.2;
    ctx.stroke();
  }

  ctx.restore();

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
