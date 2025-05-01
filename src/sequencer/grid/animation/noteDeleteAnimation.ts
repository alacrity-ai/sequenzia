// src/sequencer/grid/animation/noteDeleteAnimation.js

import { pitchToMidi } from '../../../sounds/audio/pitch-utils.js';
import { Note } from '../../interfaces/Note.js';
import { AnimationContext } from './interfaces/AnimationContext.js';

export function animateNoteDeletion(
  ctx: AnimationContext,
  note: Note,
  {
    getPitchRow,
    cellWidth,
    cellHeight,
    labelWidth
  }: {
    getPitchRow: (pitch: string) => number;
    cellWidth: number;
    cellHeight: number;
    labelWidth: number;
  }
): void {
  const x = note.start * cellWidth + labelWidth;
  const y = getPitchRow(note.pitch) * cellHeight;
  const w = note.duration * cellWidth;
  const h = cellHeight - 1;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const midi = pitchToMidi(note.pitch); // Use the robust pitchToMidi function
  if (midi === null) return;

  const baseHue = (midi * 5) % 360;

  const animCtx = ctx.animationCtx;
  const startTime = performance.now();
  const duration = 300;

  function animateFrame(now: number): void {
    const elapsed = now - startTime;
    const t = elapsed / duration;

    if (t > 1) {
      animCtx.clearRect(0, 0, animCtx.canvas.width, animCtx.canvas.height);
      return;
    }

    animCtx.clearRect(0, 0, animCtx.canvas.width, animCtx.canvas.height);
    animCtx.save();

    // Fade and shrink
    const scale = 1 - 0.4 * t;
    const alpha = 1 - t;

    const scaledW = w * scale;
    const scaledH = h * scale;

    animCtx.globalAlpha = alpha;
    animCtx.fillStyle = `hsl(${baseHue}, 100%, 70%)`;

    animCtx.beginPath();
    animCtx.roundRect(cx - scaledW / 2, cy - scaledH / 2, scaledW, scaledH, 3);
    animCtx.fill();

    animCtx.restore();
    requestAnimationFrame(animateFrame);
  }

  requestAnimationFrame(animateFrame);
}
