// src/sequencer/grid/helpers/canvas-coords.ts

import { labelWidth } from './constants.js';

/**
 * Computes logical grid-space coordinates from a mouse event.
 *
 * @param canvas - The drawing canvas
 * @param event - The mouse event
 * @param scrollContainer - The scroll wrapper (kept for API parity)
 * @param labelOffset - Width of the pitch-label gutter
 * @returns Grid-space coordinates (beats, rows)
 */
export function getCanvasPos(
  canvas: HTMLCanvasElement,
  event: MouseEvent,
  scrollContainer: HTMLElement | null,
  labelOffset: number = labelWidth
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();

  // DOM pixel dimensions after CSS zooming
  const domW = parseFloat(canvas.style.width || `${rect.width}`);
  const domH = parseFloat(canvas.style.height || `${rect.height}`);

  // Scale factors to convert DOM-pixels → canvas-pixels
  const scaleX = canvas.width / domW;
  const scaleY = canvas.height / domH;

  // Logical grid coordinates.
  const x = (event.clientX - rect.left) * scaleX - labelOffset;
  const y = (event.clientY - rect.top) * scaleY;

  return { x, y };
}
