// src/sequencer/grid/drawing/mini-contour.ts

import { pitchToMidi } from '../../../sounds/audio/pitch-utils.js';
import { TRACK_COLORS } from '../helpers/sequencerColors.js';
import { getTotalBeats, getTimeSignature, getTotalMeasures } from '../../transport.js';
import { Note } from '../../interfaces/Note.js';

interface Sequencer {
  notes: Note[];
  config: { noteRange: [string, string] };
}

export function drawMiniContour(
  canvas: HTMLCanvasElement,
  notes: Note[],
  config: any,
  colorIndex = 0
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!notes.length) return;

  const color = TRACK_COLORS[colorIndex % TRACK_COLORS.length];
  ctx.fillStyle = color;

  const totalBeats = getTotalBeats();

  const midiNotes = notes.map(note => pitchToMidi(note.pitch)).filter((midi): midi is number => midi !== null);
  if (!midiNotes.length) return;

  let minUsedMidi = Math.min(...midiNotes);
  let maxUsedMidi = Math.max(...midiNotes);
  let pitchRange = Math.max(1, maxUsedMidi - minUsedMidi);

  while (H % pitchRange !== 0) {
    maxUsedMidi++;
    pitchRange = maxUsedMidi - minUsedMidi;
  }

  const blockH = H / pitchRange;

  for (const note of notes) {
    const midi = pitchToMidi(note.pitch);
    if (midi == null) continue;

    const rawX = (note.start / totalBeats) * W;
    const rawW = (note.duration / totalBeats) * W;
    const norm = (midi - minUsedMidi) / pitchRange;
    const rawY = H - norm * H - blockH / 2;

    const x = Math.round(rawX);
    const w = Math.max(1, Math.round(rawW));
    const y = Math.round(rawY);

    ctx.fillRect(x, y, w, blockH);
  }

  const beatsPerMeasure = getTimeSignature();
  const totalMeasures = getTotalMeasures();

  ctx.save();

  let drawEvery = 1;
  if (totalMeasures > 256) drawEvery = 16;
  else if (totalMeasures > 128) drawEvery = 8;
  else if (totalMeasures > 32) drawEvery = 4;

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

export function drawGlobalMiniContour(
  canvas: HTMLCanvasElement,
  sequencers: Sequencer[]
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const totalBeats = getTotalBeats();

  for (const seq of sequencers) {
    const { notes, config } = seq;
    if (!notes?.length) continue;

    const color = TRACK_COLORS[sequencers.indexOf(seq) % TRACK_COLORS.length];
    ctx.fillStyle = color;

    const minMidi = pitchToMidi(config.noteRange[0]);
    const maxMidi = pitchToMidi(config.noteRange[1]);
    if (minMidi == null || maxMidi == null) continue;

    const pitchRange = maxMidi - minMidi || 1;
    const blockH = Math.max(2, H / pitchRange);

    for (const note of notes) {
      const midi = pitchToMidi(note.pitch);
      if (midi == null) continue;

      const x = (note.start / totalBeats) * W;
      const w = Math.max(1, (note.duration / totalBeats) * W);
      const norm = (midi - minMidi) / pitchRange;
      const y = H - norm * H - blockH / 2;
      ctx.fillRect(x, y, w, blockH);
    }
  }
}

export function refreshGlobalMiniContour(
  globalMiniCanvas: HTMLCanvasElement,
  sequencers: Sequencer[]
): void {
  drawGlobalMiniContour(globalMiniCanvas, sequencers);
}
