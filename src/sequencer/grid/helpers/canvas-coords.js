// grid/interaction/canvas-coords.js
import { labelWidth } from './constants.js';

/**
 * Computes logical grid-space coordinates from a mouse event.
 *
 * @param {HTMLCanvasElement} canvas          The drawing canvas
 * @param {MouseEvent}        event           The mouse event
 * @param {HTMLElement}       scrollContainer The scroll wrapper   (kept for API parity)
 * @param {number}            labelOffset     Width of the pitch-label gutter
 * @returns {{ x: number, y: number }}        Grid-space coordinates (beats, rows)
 */
export function getCanvasPos(
  canvas,
  event,
  scrollContainer,
  labelOffset = labelWidth
) {
  const rect = canvas.getBoundingClientRect();

  // DOM pixel dimensions after CSS zooming
  const domW = parseFloat(canvas.style.width  || rect.width);
  const domH = parseFloat(canvas.style.height || rect.height);

  // Scale factors to convert DOM-pixels → canvas-pixels
  const scaleX = canvas.width  / domW;
  const scaleY = canvas.height / domH;

  // Logical grid coordinates.
  // ① subtract canvas-left to get DOM-x inside canvas
  // ② scale to canvas pixel space
  // ③ remove the fixed left-hand label gutter (labelOffset)
  // ④ NO scrollLeft / scrollTop compensation anymore
  const x = (event.clientX - rect.left) * scaleX - labelOffset;
  const y = (event.clientY - rect.top ) * scaleY;

  return { x, y };
}
