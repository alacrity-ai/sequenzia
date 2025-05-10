// src/sequencer/matrix/scrollbars/ScrollbarDragHandler.ts

import type { GridScroll } from './GridScroll.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';

export class ScrollbarDragHandler {
  private track: HTMLDivElement;

  // Hoisted handlers
  private readonly onMouseEnter = () => this.interactionStore.setIsOnScrollbar(true);
  private readonly onMouseLeave = () => this.interactionStore.setIsOnScrollbar(false);
  private readonly onThumbMouseDown = (e: MouseEvent) => this.handleMouseDown(e);

  // Bound document-level handlers (created only during drag)
  private onMouseMove: ((e: MouseEvent) => void) | null = null;
  private onMouseUp: (() => void) | null = null;

  constructor(
    private thumb: HTMLDivElement,
    private isHorizontal: boolean,
    private scroll: GridScroll,
    private interactionStore: InteractionStore,
    private requestRedraw: () => void
  ) {
    const track = this.thumb.parentElement as HTMLDivElement;
    if (!track) throw new Error("Scrollbar thumb must have a parent track element.");
    this.track = track;

    this.attachDragHandler();
  }

  private attachDragHandler(): void {
    this.track.addEventListener('mouseenter', this.onMouseEnter);
    this.track.addEventListener('mouseleave', this.onMouseLeave);
    this.thumb.addEventListener('mouseenter', this.onMouseEnter);
    this.thumb.addEventListener('mouseleave', this.onMouseLeave);
    this.thumb.addEventListener('mousedown', this.onThumbMouseDown);
  }

  private handleMouseDown(e: MouseEvent): void {
    e.preventDefault();

    this.interactionStore.setIsScrolling(true);

    this.onMouseMove = (ev: MouseEvent): void => {
      const rect = this.track.getBoundingClientRect();

      const trackLength = this.isHorizontal ? this.track.offsetWidth : this.track.offsetHeight;
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

    this.onMouseUp = (): void => {
      document.removeEventListener('mousemove', this.onMouseMove!);
      document.removeEventListener('mouseup', this.onMouseUp!);
      this.interactionStore.setIsScrolling(false);
      this.onMouseMove = null;
      this.onMouseUp = null;
    };

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  public destroy(): void {
    this.track.removeEventListener('mouseenter', this.onMouseEnter);
    this.track.removeEventListener('mouseleave', this.onMouseLeave);
    this.thumb.removeEventListener('mouseenter', this.onMouseEnter);
    this.thumb.removeEventListener('mouseleave', this.onMouseLeave);
    this.thumb.removeEventListener('mousedown', this.onThumbMouseDown);

    // In case drag is active when destroy is called
    if (this.onMouseMove) {
      document.removeEventListener('mousemove', this.onMouseMove);
    }
    if (this.onMouseUp) {
      document.removeEventListener('mouseup', this.onMouseUp);
    }

    this.onMouseMove = null;
    this.onMouseUp = null;
  }
}
