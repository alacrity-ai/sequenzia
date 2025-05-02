// src/sequencer/grid/animation/notePlacementAnimation.ts

import { pitchToMidi } from '../../../sounds/audio/pitch-utils.js';
import { Note } from '../../interfaces/Note.js';
import { AnimationContext } from './interfaces/AnimationContext.js';

/**
 * Animates the placement of a note, including ripple effects and inner flash.
 * 
 * @param ctx - The canvas context used for drawing the animation (with animationCtx).
 * @param note - The note being animated.
 * @param options - Options to customize the animation.
 * @param options.getPitchRow - Function to convert pitch to row index.
 * @param options.cellWidth - Width of each cell in the grid.
 * @param options.cellHeight - Height of each cell in the grid.
 * @param options.labelWidth - Width of the label area (for offset).
 */
export function animateNotePlacement(
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
  const animCtx = ctx.animationCtx;
  if (!animCtx) return;

  const x = note.start * cellWidth + labelWidth;
  const y = getPitchRow(note.pitch) * cellHeight;
  const w = note.duration * cellWidth;
  const h = cellHeight - 1;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const midi = pitchToMidi(note.pitch);
  if (midi === null) return;

  const baseHue = (midi * 5) % 360;
  const strokeColor = `hsl(${baseHue}, 100%, 65%)`;
  const flashColorTemplate = `hsla(${baseHue}, 100%, 80%, `;

  const startTime = performance.now();
  const duration = 500;
  const pad = 20;

  const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

  const rippleConfig = Array.from({ length: 3 }, (_, i) => ({
    radiusScale: 0.1 + i * 0.1,
    delay: i * 60,
    alphaScale: 0.2,
  }));

  function drawRipple(localT: number, { radiusScale, alphaScale }: typeof rippleConfig[0]): void {
    if (!animCtx) return;

    const pulse = Math.sin(localT * Math.PI);
    const scale = 1 + radiusScale * pulse;
    const alpha = (1 - localT) * alphaScale;

    animCtx.globalAlpha = alpha;
    animCtx.strokeStyle = strokeColor;
    animCtx.lineWidth = 2;

    const scaledW = w * scale;
    const scaledH = h * scale;

    animCtx.beginPath();
    animCtx.roundRect(cx - scaledW / 2, cy - scaledH / 2, scaledW, scaledH, 4);
    animCtx.stroke();
  }

  function drawFlash(t: number): void {
    if (!animCtx) return;

    const flashAlpha = Math.sin(t * Math.PI);
    animCtx.globalAlpha = 1.0;
    animCtx.fillStyle = flashColorTemplate + (0.4 * flashAlpha) + ')';

    animCtx.beginPath();
    animCtx.roundRect(x, y, w, h, 3);
    animCtx.fill();
  }

  function animateFrame(now: number): void {
    if (!animCtx) return;
    const elapsed = now - startTime;
    const t = elapsed / duration;

    if (t > 1) {
      animCtx.clearRect(x - pad, y - pad, w + 2 * pad, h + 2 * pad);
      return;
    }

    animCtx.clearRect(x - pad, y - pad, w + 2 * pad, h + 2 * pad);

    drawFlash(t);
    for (const ripple of rippleConfig) {
      const localT = clamp01((elapsed - ripple.delay) / (duration - ripple.delay));
      drawRipple(localT, ripple);
    }

    requestAnimationFrame(animateFrame);
  }

  requestAnimationFrame(animateFrame);
}
