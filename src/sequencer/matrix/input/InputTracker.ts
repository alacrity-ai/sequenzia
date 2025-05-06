// src/sequencer/matrix/input/MouseTracker.ts

import type { InteractionContext } from './InteractionContext.js';

export class InputTracker {
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
    this.canvas.addEventListener('mouseenter', this.onMouseEnter);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('keydown', this.onKeyDown);
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
    this.context.handleMouseLeave();
  };

  private onMouseEnter = (e: MouseEvent): void => {
    this.context.handleMouseEnter?.(e);
  };

  private onContextMenu = (e: MouseEvent): void => {
    this.context.handleContextMenu(e);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    this.context.handleKeyDown(e);
  };

  public destroy(): void {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseenter', this.onMouseEnter);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    this.canvas.removeEventListener('keydown', this.onKeyDown);
  }
}
