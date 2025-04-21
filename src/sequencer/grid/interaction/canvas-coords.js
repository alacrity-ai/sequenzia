// grid/interaction/canvas-coords.js
import { labelWidth } from '../constants.js';

/**
 * Computes logical grid-space coordinates from a mouse event.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {MouseEvent} event - The mouse event
 * @param {HTMLElement} scrollContainer - The scroll container
 * @param {number} labelOffset - Left-side label width to subtract
 * @returns {{ x: number, y: number }}
 */
export function getCanvasPos(canvas, event, scrollContainer, labelOffset = labelWidth) {
  const rect = canvas.getBoundingClientRect();

  // ⚠️ Use `style.width` and `style.height`, which reflect DOM pixels after zooming
  const domWidth = parseFloat(canvas.style.width || rect.width);
  const domHeight = parseFloat(canvas.style.height || rect.height);

  // 🧠 Scale to match internal drawing resolution (canvas.width is in grid-units)
  const scaleX = canvas.width / domWidth;
  const scaleY = canvas.height / domHeight;

  const x = (event.clientX - rect.left) * scaleX + scrollContainer.scrollLeft - labelOffset;
  const y = (event.clientY - rect.top) * scaleY + scrollContainer.scrollTop;

  return { x, y };
}
