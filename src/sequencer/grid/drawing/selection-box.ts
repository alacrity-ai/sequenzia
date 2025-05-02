// src/sequencer/grid/drawing/selection-box.ts

import { drawRoundedRect } from './rounded-rect.js';
import { HandlerContext } from '../../interfaces/HandlerContext.js';

/**
 * Draws the marquee selection box during note selection.
 *
 * @param ctx - Canvas rendering context
 * @param handlerContext - Context containing current selection box data
 */
export function drawMarqueeSelectionBox(
  ctx: CanvasRenderingContext2D,
  handlerContext: HandlerContext
): void {
  const box = handlerContext.selectionBox;
  if (!box || !box.active) return;

  const { startX, startY, currentX, currentY } = box;
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  // Skip drawing if width or height is trivially small (e.g., accidental click)
  if (width < 1 || height < 1) return;

  ctx.save();

  // Hoist these to constants if reused or changed rarely
  ctx.strokeStyle = 'rgba(128, 90, 213, 1.0)';
  ctx.lineWidth = 2;

  // setLineDash allocates a new dash pattern array internally
  // Only set if not already configured (optional, only matters in high-freq redrawing)
  ctx.setLineDash([5, 5]);

  drawRoundedRect(ctx, left, top, width, height, 3);
  ctx.stroke();

  ctx.restore();
}
