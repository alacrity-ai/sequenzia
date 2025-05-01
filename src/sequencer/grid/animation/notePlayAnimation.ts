// src/sequencer/grid/animation/notePlayAnimation.ts

import { getTempo } from "../../transport.js";
import { Note } from '../../interfaces/Note.js';
import { AnimationContext } from './interfaces/AnimationContext.js';
import { pitchToMidi } from "../../../sounds/audio/pitch-utils.js";

/**
 * Animates the playing of a note with pulsing and ripple effects.
 * 
 * @param ctx - The canvas context used for drawing the animation (with animationCtx).
 * @param note - The note being animated.
 * @param options - Options to customize the animation.
 * @param options.getPitchRow - Function to convert pitch to row index.
 * @param options.cellWidth - Width of each cell in the grid.
 * @param options.cellHeight - Height of each cell in the grid.
 * @param options.labelWidth - Width of the label area (for offset).
 */
export function animateNotePlay(
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
  if (!ctx?.animationCtx) {
    console.warn('Missing animationCtx in animateNotePlay');
    return;
  }

  const x = note.start * cellWidth + labelWidth;
  const y = getPitchRow(note.pitch) * cellHeight;
  const w = note.duration * cellWidth;
  const h = cellHeight - 1;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const midi = pitchToMidi(note.pitch) || 0;
  const hue = (midi * 5) % 360;

  const baseCtx = ctx.animationCtx;
  const offscreen = document.createElement('canvas');
  offscreen.width = baseCtx.canvas.width;
  offscreen.height = baseCtx.canvas.height;
  
  // Null check for offscreen context
  let animCtx = offscreen.getContext('2d');
  if (!animCtx) {
    console.warn('Could not get animation context from offscreen canvas');
    return;
  }

  const startTime = performance.now();
  const bpm = getTempo();
  let duration = (note.duration * 60000) / bpm;
  duration = Math.max(100, Math.min(duration, 1600));

  const rippleCount = 2;
  const rippleDelay = 50;

  // Function to draw the pulsing effect
  function drawPulse(t: number): void {
    const pulseAlpha = Math.sin(t * Math.PI);
    const fillColor = `hsla(${hue}, 100%, 70%, ${0.4 * pulseAlpha})`;

    if (animCtx) {
      animCtx.globalAlpha = 1.0;
      animCtx.fillStyle = fillColor;

      animCtx.beginPath();
      animCtx.roundRect(x, y, w, h, 3);
      animCtx.fill();
    }
  }

  // Function to draw ripple effect
  function drawRipple(localT: number, scaleFactor: number, alphaFactor: number): void {
    const pulse = Math.sin(localT * Math.PI);
    const scale = 1 + scaleFactor * pulse;
    const alpha = (1 - localT) * alphaFactor;

    if (animCtx) {
      animCtx.globalAlpha = alpha;
      animCtx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
      animCtx.lineWidth = 1.5;

      const scaledW = w * scale;
      const scaledH = h * scale;

      animCtx.beginPath();
      animCtx.roundRect(cx - scaledW / 2, cy - scaledH / 2, scaledW, scaledH, 4);
      animCtx.stroke();
    }
  }

  // Frame animation function
  function animateFrame(now: number): void {
    const elapsed = now - startTime;
    const t = elapsed / duration;

    if (t > 1) {
      // Clean up reference (not strictly required, but safe practice)
      animCtx = null;
      offscreen.width = 0;
      offscreen.height = 0;
      return;
    }

    if (animCtx) {
      animCtx.clearRect(0, 0, offscreen.width, offscreen.height);
      animCtx.save();

      drawPulse(t); // 🌟 The inner glow flash

      for (let i = 0; i < rippleCount; i++) {
        const rippleOffset = i * rippleDelay;
        const localT = Math.max(0, Math.min(1, (elapsed - rippleOffset) / (duration - rippleOffset)));
        drawRipple(localT, 0.1 + i * 0.1, 0.3);
      }

      animCtx.restore();

      // Composite onto main animation canvas
      baseCtx.save();
      const rippleScale = 1.5;
      const clearW = w * rippleScale + 8;
      const clearH = h * rippleScale + 8;
      baseCtx.clearRect(cx - clearW / 2, cy - clearH / 2, clearW, clearH);
      baseCtx.globalAlpha = 1.0;
      baseCtx.drawImage(offscreen, 0, 0);
      baseCtx.restore();
    }

    requestAnimationFrame(animateFrame);
  }

  requestAnimationFrame(animateFrame);
}
