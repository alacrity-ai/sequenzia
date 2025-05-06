// src/sequencer/matrix/utils/snapping.ts

import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridSnappingContext } from '../interfaces/GridSnappingContext.js';
import type { SnappedNotePosition } from '../interfaces/SnappedNotePosition.js';
import { getRelativeMousePos } from './gridPosition.js';
import { getGridRelativeMousePos } from './gridPosition.js';
import { getSnappedNotePosition } from './snapPosition.js';

export function getSnappedFromEvent(
    e: MouseEvent,
    canvas: HTMLElement,
    grid: GridSnappingContext,
    scroll: GridScroll,
    config: GridConfig
  ): SnappedNotePosition | null {
    const mouse = getRelativeMousePos(e, canvas);
    const snap = grid.getSnapResolution();
    const triplet = grid.isTripletMode();
    return getSnappedNotePosition(mouse, scroll, config, snap, triplet);
  }


export function getRawBeatFromEvent(
    e: MouseEvent,
    canvas: HTMLElement,
    scroll: GridScroll,
    config: GridConfig
): number {
    const { baseCellWidth } = config.layout;
    const { zoom } = config.behavior;
    const mouse = getGridRelativeMousePos(e, canvas, scroll, config);
    const cellWidth = baseCellWidth * zoom;
    return mouse.x / cellWidth;
}
  