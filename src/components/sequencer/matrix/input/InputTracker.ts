// src/sequencer/matrix/input/InputTracker.ts

import type { InteractionContext } from './InteractionContext.js';
import type { OverlayInteractionContext } from './OverlayInteractionContext.js';
import { 
  getLastActiveSequencerId, 
  setLastActiveSequencerId,
 } from '@/components/sequencer/stores/sequencerStore.js';

export class InputTracker {
  constructor(
    private readonly context: InteractionContext,
    private readonly overlayContext: OverlayInteractionContext,
    private readonly canvas: HTMLElement,
    private readonly sequencerContext: { getId(): number; isCollapsed(): boolean }
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
    window.addEventListener('mouseup', this.onGlobalMouseUp);
    window.addEventListener('keydown', this.onKeyDown);
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (this.overlayContext.handleMouseMove(e)) return;
    this.context.handleMouseMove(e);
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (this.overlayContext.handleMouseDown(e)) return;
    this.context.handleMouseDown(e);
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (this.overlayContext.handleMouseUp(e)) return;
    this.context.handleMouseUp(e);
  };

  private onGlobalMouseUp = (e: MouseEvent): void => {
    // Let overlay handlers respond regardless of bounds
    if (this.overlayContext.handleGlobalMouseUp?.(e)) return;
    // fallback: main interaction context (could be extended if needed)
    this.context.handleMouseUp(e);
  };

  private onMouseLeave = (): void => {
    if (this.overlayContext.handleMouseLeave()) return;
    this.context.handleMouseLeave();
  };

  private onMouseEnter = (e: MouseEvent): void => {
    if (!this.sequencerContext.isCollapsed()) {
      const activeId = getLastActiveSequencerId();
      if (activeId !== this.sequencerContext.getId()) {
        setLastActiveSequencerId(this.sequencerContext.getId());
      }
    }
    if (this.overlayContext.handleMouseEnter(e)) return;
    this.context.handleMouseEnter(e);
  };

  private onContextMenu = (e: MouseEvent): void => {
    if (this.overlayContext.handleContextMenu(e)) return;
    this.context.handleContextMenu(e);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.overlayContext.handleKeyDown(e)) return;
    this.context.handleKeyDown(e);
  };

  public destroy(): void {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseenter', this.onMouseEnter);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('mouseup', this.onGlobalMouseUp);
    this.canvas.removeEventListener('keydown', this.onKeyDown);
  }
}
