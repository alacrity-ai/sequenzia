// src/playhead/global-playhead.ts

let ctx: CanvasRenderingContext2D | null = null;
let canvas: HTMLCanvasElement | null = null;

/**
 * Initializes the global playhead canvas and context.
 */
export function initGlobalPlayhead(canvasElement: HTMLCanvasElement): void {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
}

/**
 * Draws the global playhead at a given x-coordinate.
 * @param x - The x-position (in pixels) where the playhead should be drawn.
 */
export function drawGlobalPlayhead(x: number): void {
  if (!ctx || !canvas) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const lineX = Math.round(x) + 0.5; // Subpixel alignment for crisper lines

  // === Crisp Core Line ===
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lineX, 0);
  ctx.lineTo(lineX, height);
  ctx.stroke();
}
