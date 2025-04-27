// src/sequencer/grid/drawing/playhead-renderer.ts

/**
 * Draws the vertical red playhead line on the sequencer grid.
 *
 * @param ctx - Canvas rendering context
 * @param x - X position (relative to grid, not including label width)
 * @param labelWidth - Width of the label/piano roll section on the left
 * @param canvasHeight - Height of the entire canvas
 */
export function drawPlayhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  labelWidth: number,
  canvasHeight: number
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + labelWidth, 0);
  ctx.lineTo(x + labelWidth, canvasHeight);
  ctx.stroke();
  ctx.restore();
}
