import type { GridConfig } from '../interfaces/GridConfigTypes.js';

/**
 * Determines if a mouse event is within the header playhead bounds.
 * @param e MouseEvent
 * @param canvas Target canvas element
 * @param config GridConfig for layout dimensions
 * @returns true if inside header bounds, false otherwise
 */
export function isInHeaderBounds(e: MouseEvent, canvas: HTMLElement, config: GridConfig): boolean {
  const rect = canvas.getBoundingClientRect();
  const headerHeight = config.layout.headerHeight;
  const y = e.clientY - rect.top;

  return y >= 0 && y <= headerHeight;
}
