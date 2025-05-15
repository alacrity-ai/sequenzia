// src/sequencer/matrix/input/WheelHandler.ts

import type { GridScroll } from '../scrollbars/GridScroll.js';

export class WheelHandler {
  private readonly SCROLL_SPEED_X = 1;
  private readonly SCROLL_SPEED_Y = 1;

  constructor(
    private canvas: HTMLElement,
    private scroll: GridScroll,
    private requestRedraw: () => void,
    private zoomIn: () => void,
    private zoomOut: () => void
  ) {
    this.attachListeners();
  }

  private attachListeners(): void {
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();

    // === Ctrl+Scroll to Zoom ===
    if (e.ctrlKey) {
      if (e.deltaY < 0) {
        this.zoomIn();
      } else if (e.deltaY > 0) {
        this.zoomOut();
      }
      return; // No scroll when zooming
    }

    const isHorizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = e.deltaX || e.deltaY;

    if (isHorizontal) {
      const newX = this.scroll.getX() + delta * this.SCROLL_SPEED_X;
      this.scroll.setScroll(newX, this.scroll.getY());
    } else {
      const newY = this.scroll.getY() + e.deltaY * this.SCROLL_SPEED_Y;
      this.scroll.setScroll(this.scroll.getX(), newY);
    }

    this.requestRedraw();
  };

  // Inside WheelHandler
  public destroy(): void {
    this.canvas.removeEventListener('wheel', this.onWheel);
  }
}
