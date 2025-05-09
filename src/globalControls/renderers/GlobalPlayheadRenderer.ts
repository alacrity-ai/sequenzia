// src/globalControls/renderers/GlobalPlayheadRenderer.ts

let ctx: CanvasRenderingContext2D | null = null;
let canvas: HTMLCanvasElement | null = null;
let animationFrameId: number | null = null;

/**
 * Initializes the global playhead renderer with the given canvas.
 */
export function initGlobalPlayheadRenderer(canvasElement: HTMLCanvasElement): void {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
}

/**
 * Draws the playhead line at the specified X position.
 */
export function drawGlobalPlayhead(x: number): void {
  if (!ctx || !canvas) return;

  const DPR = window.devicePixelRatio || 1;
  const width = canvas.width / DPR;
  const height = canvas.height / DPR;
  ctx.clearRect(0, 0, width, height);

  const lineX = Math.round(x) + 0.5;

  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lineX, 0);
  ctx.lineTo(lineX, height);
  ctx.stroke();
}

/**
 * Pauses the visual playhead (cancels animation frame).
 */
export function pauseGlobalPlayhead(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Stops the visual playhead and clears the canvas.
 */
export function stopGlobalPlayhead(): void {
  pauseGlobalPlayhead();
  drawGlobalPlayhead(0);
}

/**
 * Registers an external animation frame ID for future cancellation.
 */
export function setGlobalPlayheadAnimationFrame(id: number): void {
  animationFrameId = id;
}
