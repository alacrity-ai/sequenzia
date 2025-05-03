// src/sequencer/matrix/input/MouseTracker.ts

import type { InteractionContext } from './InteractionContext.js';

export class MouseTracker {
  constructor(
    private readonly context: InteractionContext,
    private readonly canvas: HTMLElement,
  ) {
    this.attachListeners();
    this.canvas.style.pointerEvents = 'auto';
  }

  private attachListeners(): void {
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.context.handleMouseMove(e);
  };

  private onMouseDown = (e: MouseEvent): void => {
    this.context.handleMouseDown(e);
  };

  private onMouseUp = (e: MouseEvent): void => {
    this.context.handleMouseUp(e);
  };

  private onMouseLeave = (): void => {
    // Could call `handleMouseLeave` if supported in future
  };

  public destroy(): void {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
  }
}
