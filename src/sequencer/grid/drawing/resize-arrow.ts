// src/sequencer/grid/drawing/resize-arrow.ts

import { Note } from '../../interfaces/Note.js';

interface DrawResizeArrowOptions {
  cellWidth: number;
  cellHeight: number;
  getPitchRow: (pitch: string) => number;
  isHovered?: boolean;
}

/**
 * Draws a resize handle (arrow) at the right edge of a note.
 *
 * @param ctx - The canvas context to draw onto.
 * @param note - The note object ({ pitch, start, duration, etc. }).
 * @param options - Drawing options.
 */
export function drawResizeArrow(
  ctx: CanvasRenderingContext2D,
  note: Note,
  {
    cellWidth,
    cellHeight,
    getPitchRow,
    isHovered = false,
  }: DrawResizeArrowOptions
): void {
  const arrowSize = Math.min(10, cellHeight * 0.8);
  const padding = 6;
  const x = (note.start + note.duration) * cellWidth + padding;
  const y = getPitchRow(note.pitch) * cellHeight + (cellHeight - arrowSize) / 2;

  ctx.save();

  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered
    ? 'rgba(0, 255, 255, 0.95)' // Bright cyan for hovered
    : 'rgba(255, 255, 255, 0.85)';

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + arrowSize, y + arrowSize / 2);
  ctx.lineTo(x, y + arrowSize);
  ctx.closePath();
  ctx.fill();

  // Glossy overlay
  const gloss = ctx.createLinearGradient(x, y, x, y + arrowSize);
  gloss.addColorStop(0, 'rgba(255,255,255,0.9)');
  gloss.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + arrowSize, y + arrowSize / 2);
  ctx.lineTo(x, y + arrowSize);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
