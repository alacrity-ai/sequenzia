import { GridConfig } from '../interfaces/GridConfigTypes.js';
import { GridScroll } from '../scrollbars/GridScroll.js';

// Adjustable overscan buffers (in pixels)
const X_OVERSCAN_PX = 34;
const Y_OVERSCAN_PX = 24;

/**
 * Prevents note placement if the snapped note is too close to the visual canvas edge.
 */
export function isNoteNearVisibleEdge(
    position: { x: number; y: number },
    scroll: GridScroll,
    config: GridConfig,
    canvas: HTMLCanvasElement
  ): boolean {
    const {
      layout: { baseCellWidth, verticalCellRatio, labelWidth, headerHeight },
      behavior: { zoom }
    } = config;
  
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;
  
    const xPx = position.x * cellWidth - scroll.getX() + labelWidth;
    if (xPx < X_OVERSCAN_PX || xPx > canvas.offsetWidth - X_OVERSCAN_PX) return true;
  
    const yPx = position.y * cellHeight - scroll.getY() + headerHeight;
    if (yPx < Y_OVERSCAN_PX || yPx > canvas.offsetHeight - Y_OVERSCAN_PX) return true;
  
    return false;
  }
  