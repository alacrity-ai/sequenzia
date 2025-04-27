// src/sequencer/grid/animation/notePlacementAnimation.ts

import { pitchToMidi } from '../../../audio/pitch-utils.js';
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
  const x = note.start * cellWidth + labelWidth;
  const y = getPitchRow(note.pitch) * cellHeight;
  const w = note.duration * cellWidth;
  const h = cellHeight - 1;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const midi = pitchToMidi(note.pitch);
  if (midi === null) return;

  const baseHue = (midi * 5) % 360;

  const animCtx = ctx.animationCtx;
  const startTime = performance.now();
  const duration = 500;

  const ripples = 3;
  const rippleDelay = 60;

  // Function to draw ripples
  function drawRipple(localT: number, radiusScale: number, alphaScale: number): void {
    const pulse = Math.sin(localT * Math.PI);
    const scale = 1 + radiusScale * pulse;
    const alpha = (1 - localT) * alphaScale;

    animCtx.globalAlpha = alpha;
    animCtx.strokeStyle = `hsl(${baseHue}, 100%, 65%)`;
    animCtx.lineWidth = 2;

    const scaledW = w * scale;
    const scaledH = h * scale;

    animCtx.beginPath();
    animCtx.roundRect(cx - scaledW / 2, cy - scaledH / 2, scaledW, scaledH, 4);
    animCtx.stroke();
  }

  // Function to draw the flash effect
  function drawFlash(t: number): void {
    const flashAlpha = Math.sin(t * Math.PI); // Full at t=0.5
    const fillHue = baseHue;
    const fillColor = `hsla(${fillHue}, 100%, 80%, ${0.4 * flashAlpha})`;

    animCtx.globalAlpha = 1.0;
    animCtx.fillStyle = fillColor;

    animCtx.beginPath();
    animCtx.roundRect(x, y, w, h, 3);
    animCtx.fill();
  }

  // Frame animation function
  function animateFrame(now: number): void {
    const elapsed = now - startTime;
    const t = elapsed / duration;

    if (t > 1) {
      animCtx.clearRect(0, 0, animCtx.canvas.width, animCtx.canvas.height);
      return;
    }

    animCtx.clearRect(0, 0, animCtx.canvas.width, animCtx.canvas.height);
    animCtx.save();

    drawFlash(t); // 🌟 The inner glow flash

    for (let i = 0; i < ripples; i++) {
      const rippleOffset = i * rippleDelay;
      const localT = Math.max(0, Math.min(1, (elapsed - rippleOffset) / (duration - rippleOffset)));
      drawRipple(localT, 0.1 + i * 0.1, 0.2);
    }

    animCtx.restore();
    requestAnimationFrame(animateFrame);
  }

  requestAnimationFrame(animateFrame);
}

