// src/sequencer/grid/drawing/selection-box.ts

import { drawRoundedRect } from './rounded-rect.js';

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface HandlerContext {
  selectionBox: SelectionBox | null;
}

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
  if (!box) return;

  const x1 = box.startX;
  const y1 = box.startY;
  const x2 = box.currentX;
  const y2 = box.currentY;
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  ctx.save();
  ctx.strokeStyle = 'rgba(128, 90, 213, 1.0)'; // Tailwind purple-500
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  drawRoundedRect(ctx, left, top, width, height, 3);
  ctx.stroke();
  ctx.restore();
}
