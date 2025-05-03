// src/sequencer/matrix/scrollbars/ScrollbarDragHandler.ts

import type { GridScroll } from './GridScroll.js';

export class ScrollbarDragHandler {
  constructor(
    private thumb: HTMLDivElement,
    private isHorizontal: boolean,
    private scroll: GridScroll,
    private requestRedraw: () => void
  ) {
    this.attachDragHandler();
  }

  private attachDragHandler(): void {
    const track = this.thumb.parentElement as HTMLDivElement;
    if (!track) return;

    this.thumb.addEventListener('mousedown', e => {
      e.preventDefault();

      const onMouseMove = (ev: MouseEvent): void => {
        const rect = track.getBoundingClientRect();
      
        // ✅ Use zoom-invariant layout size
        const trackLength = this.isHorizontal ? track.offsetWidth : track.offsetHeight;
      
        const clientCoord = this.isHorizontal ? ev.clientX : ev.clientY;
        const coordInTrack = clientCoord - (this.isHorizontal ? rect.left : rect.top);
      
        const thumbSize = this.isHorizontal ? this.thumb.offsetWidth : this.thumb.offsetHeight;
        const maxTrackTravel = trackLength - thumbSize;
      
        const clampedCoord = Math.max(0, Math.min(coordInTrack - thumbSize / 2, maxTrackTravel));
        const scrollRatio = maxTrackTravel > 0 ? clampedCoord / maxTrackTravel : 0;
      
        const maxScroll = this.isHorizontal ? this.scroll.getMaxScrollX() : this.scroll.getMaxScrollY();
        const newScroll = scrollRatio * maxScroll;
      
        if (this.isHorizontal) {
          this.scroll.setScroll(newScroll, this.scroll.getY());
        } else {
          this.scroll.setScroll(this.scroll.getX(), newScroll);
        }
      
        this.requestRedraw();
      };
      

      const onMouseUp = (): void => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }
}
