// src/sequencer/matrix/input/MouseTracker.ts
import { getRelativeMousePos } from '../utils/gridPosition.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { InteractionStore } from './stores/InteractionStore.js';
import type { GridSnappingContext } from '../interfaces/GridSnappingContext.js';
import { getSnappedNotePosition } from '../utils/snapPosition.js';


export class MouseTracker {
  constructor(
    private readonly grid: GridSnappingContext,
    private readonly canvas: HTMLElement,
    private readonly scroll: GridScroll,
    private readonly config: GridConfig,
    private readonly store: InteractionStore,
    private readonly requestRedraw: () => void
  ) {
    this.attachListeners();
    this.canvas.style.pointerEvents = 'auto';
  }

  private attachListeners(): void {
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
  }

  private onMouseMove = (e: MouseEvent): void => {
    const mouse = getRelativeMousePos(e, this.canvas);
    const snap = this.grid.getSnapResolution();
    const triplet: boolean = this.grid.isTripletMode();
    const snapped = getSnappedNotePosition(mouse, this.scroll, this.config, snap, triplet);
    this.store.setHoveredNotePosition(snapped);
    this.requestRedraw();
  };

  private onMouseLeave = (): void => {
    this.store.setHoveredNotePosition(null);
    this.requestRedraw();
  };

  public destroy(): void {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
  }
}
