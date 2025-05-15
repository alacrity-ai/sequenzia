// src/shared/ui/canvas/drawAIIndicatorChevron.ts

/**
 * Draws an AI indicator chevron at a given position.
 *
 * @param ctx - Canvas rendering context.
 * @param x - X position of the chevron tip.
 * @param baseY - Y position of the chevron base line.
 * @param width - Width of the chevron.
 * @param height - Height of the chevron.
 * @param direction - 'up' (points up) or 'down' (points down).
 * @param color - Fill color for the chevron.
 */
export function drawAIIndicatorChevron(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  height: number,
  direction: 'up' | 'down' = 'up',
  color = 'rgb(252, 159, 207)'
): void {
  ctx.fillStyle = color;
  ctx.beginPath();

  if (direction === 'up') {
    ctx.moveTo(x, baseY - height); // tip upwards
    ctx.lineTo(x - width / 2, baseY); // bottom left
    ctx.lineTo(x + width / 2, baseY); // bottom right
  } else {
    ctx.moveTo(x, baseY + height); // tip downwards
    ctx.lineTo(x - width / 2, baseY); // top left
    ctx.lineTo(x + width / 2, baseY); // top right
  }

  ctx.closePath();
  ctx.fill();
}
