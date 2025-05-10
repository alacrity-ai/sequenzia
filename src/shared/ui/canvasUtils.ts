// src/shared/ui/canvasUtils.ts

/**
 * Sets the internal resolution of a canvas based on desired CSS dimensions and devicePixelRatio.
 * Also updates the style to match.
 *
 * @param canvas - The HTMLCanvasElement to configure
 * @param cssWidth - Width in CSS pixels (e.g., 1100)
 * @param cssHeight - Height in CSS pixels (e.g., 75)
 */
export function setCanvasDimensions(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number): void {
  const DPR = window.devicePixelRatio || 1;

  canvas.width = cssWidth * DPR;
  canvas.height = cssHeight * DPR;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext('2d');
  if (ctx) ctx.scale(DPR, DPR);
}
