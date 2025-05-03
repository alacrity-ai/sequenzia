// src/sequencer/matrix/input/InteractionContext.ts

import { InteractionMode } from './interfaces/InteractionEnum.js';
import { GridInteractionHandler } from './interfaces/GridInteractionHandler.js';
import { PlaceNoteHandler } from './handlers/PlaceNoteHandler.js';
import type { InteractionContextData } from './interfaces/InteractionContextData.js';

export class InteractionContext {
  private mode: InteractionMode = InteractionMode.Idle;
  private activeHandler: GridInteractionHandler | null = null;

  constructor(private readonly data: InteractionContextData) {
    this.transitionTo(InteractionMode.PlacingNote); // Set default interaction
  }

  public transitionTo(mode: InteractionMode): void {
    this.activeHandler?.onExit?.();
    this.mode = mode;
    this.activeHandler = this.createHandlerForMode(mode);
    this.activeHandler?.onEnter?.();
  }

  public handleMouseDown(e: MouseEvent): void {
    this.activeHandler?.onMouseDown?.(e);
  }

  public handleMouseMove(e: MouseEvent): void {
    this.activeHandler?.onMouseMove?.(e);
  }

  public handleMouseUp(e: MouseEvent): void {
    this.activeHandler?.onMouseUp?.(e);
  }

  private createHandlerForMode(mode: InteractionMode): GridInteractionHandler {
    switch (mode) {
      case InteractionMode.PlacingNote:
        return new PlaceNoteHandler(
          this.data.canvas,
          this.data.noteManager,
          this.data.scroll,
          this.data.config,
          this.data.store,
          this.data.grid,
          this.data.addNote,
          this.data.requestRedraw
        );
      default:
        return {};
    }
  }
}
