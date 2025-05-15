// src/sequencer/matrix/input/OverlayInteractionContext.ts

import type { OverlayHandler } from './interfaces/OverlayHandler.js';
import type { OverlayContextData } from './interfaces/OverlayContextData.js';

import { TransportSeekHandler } from './overlays/TransportSeekHandler.js';

export class OverlayInteractionContext {
  private readonly handlers: OverlayHandler[];

  constructor(data: OverlayContextData) {
    this.handlers = [
      new TransportSeekHandler(
        data.canvas,
        data.scroll,
        data.config,
        data.sequencerConfig,
        data.requestRedraw,
        data.getSequencerId,
        data.cursorController,
        data.store
      ),
      // Future overlay handlers would go here.
      // new LoopBracketHandler(...),
      // new AutomationLaneHandler(...),
    ];
  }

  public handleMouseDown(e: MouseEvent): boolean {
    return this.dispatch('onMouseDown', e);
  }

  public handleMouseMove(e: MouseEvent): boolean {
    return this.dispatch('onMouseMove', e);
  }

  public handleMouseUp(e: MouseEvent): boolean {
    return this.dispatch('onMouseUp', e);
  }

  public handleGlobalMouseUp(e: MouseEvent): boolean {
    for (const handler of this.handlers) {
      if ('onGlobalMouseUp' in handler && typeof handler.onGlobalMouseUp === 'function') {
        const result = handler.onGlobalMouseUp(e as MouseEvent);
        if (result === true) return true;
      }
    }
    return false;
  }

  public handleContextMenu(e: MouseEvent): boolean {
    return this.dispatch('onContextMenu', e);
  }

  public handleMouseLeave(): boolean {
    return this.dispatch('onMouseLeave');
  }

  public handleMouseEnter(e: MouseEvent): boolean {
    return this.dispatch('onMouseEnter', e);
  }

  public handleKeyDown(e: KeyboardEvent): boolean {
    return this.dispatch('onKeyDown', e);
  }

  private dispatch<T extends MouseEvent | KeyboardEvent | void>(
    method: keyof OverlayHandler,
    event?: T
  ): boolean {
    for (const handler of this.handlers) {
      const result = (handler[method] as ((e: T) => boolean | undefined) | undefined)?.(event as T);
      if (result === true) {
        return true;
      }
    }
    return false;
  }

  public destroy(): void {
    for (const handler of this.handlers) {
      handler.destroy?.();
    }
  }
}
