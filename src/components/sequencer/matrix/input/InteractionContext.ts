// src/sequencer/matrix/input/InteractionContext.ts

import { devLog } from '@/shared/state/devMode.js';
import { InteractionMode } from './interfaces/InteractionEnum.js';
import { GridInteractionHandler } from './interfaces/GridInteractionHandler.js';
import { DefaultNoteToolHandler } from './handlers/DefaultNoteToolHandler.js';
import { SelectingToolHandler } from './handlers/SelectingToolHandler.js';
import { SelectedIdleToolHandler } from './handlers/SelectedIdleToolHandler.js';
import { PastingToolHandler } from './handlers/PastingToolHandler.js';
import { DraggingToolHandler } from './handlers/DraggingToolHandler.js';
import { SizingToolHandler } from './handlers/SizingToolHandler.js';
import { ExpressNoteToolHandler } from './handlers/ExpressNoteToolHandler.js';
import { ExpressSelectedIdleToolHandler } from './handlers/ExpressSelectedIdleToolHandler.js';
import { getUserConfig } from '@/components/userSettings/store/userConfigStore.js';

import type { InteractionContextData } from './interfaces/InteractionContextData.js';
import type { InteractionController } from './interfaces/InteractionController.js';

export class InteractionContext {
  private mode: InteractionMode = InteractionMode.NoteTool;
  private activeHandler: GridInteractionHandler | null = null;

  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  constructor(private readonly data: InteractionContextData) {
    this.transitionTo(InteractionMode.NoteTool);
  }
  
  public handleMouseDown(e: MouseEvent): void {
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.activeHandler?.onMouseDown?.(e);
  }

  public handleMouseMove(e: MouseEvent): void {
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.activeHandler?.onMouseMove?.(e);
  }

  public handleMouseUp(e: MouseEvent): void {
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.activeHandler?.onMouseUp?.(e);
  }

  public handleContextMenu(e: MouseEvent): void {
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.activeHandler?.onContextMenu?.(e);
  }

  public handleMouseLeave(): void {
    this.activeHandler?.onMouseLeave?.();
  }

  public handleMouseEnter(e: MouseEvent): void {
    this.activeHandler?.onMouseEnter?.(e);
  }  

  public handleKeyDown(e: KeyboardEvent): void {
    this.activeHandler?.onKeyDown?.(e);
  }  

  public transitionTo(mode: InteractionMode): void {
    devLog(`Transitioning to mode: ${InteractionMode[mode]} from ${InteractionMode[this.mode]}`);
    this.activeHandler?.onExit?.();
    this.mode = mode;
    this.activeHandler = this.createHandlerForMode(mode);
    this.activeHandler?.onEnter?.();
  }

  public reset(): void {
    this.transitionTo(InteractionMode.NoteTool);
  }

  private createHandlerForMode(mode: InteractionMode): GridInteractionHandler {
    const controller: InteractionController = {
      transitionTo: (mode) => this.transitionTo(mode),
      getLastMouseX: () => this.lastMouseX,
      getLastMouseY: () => this.lastMouseY,
    };

    switch (mode) {
      case InteractionMode.NoteTool: {
        const { global: { noteToolMode } } = getUserConfig();
      
        const ctor = noteToolMode === 'express'
          ? ExpressNoteToolHandler
          : DefaultNoteToolHandler;
      
        const args = [
          this.data.canvas,
          this.data.noteManager,
          this.data.scroll,
          this.data.config,
          this.data.store,
          this.data.grid,
          this.data.requestRedraw,
          () => this.data.sequencerContext.getId(),
          controller,
          this.data.cursorController,
          this.data.getClipboard,
          this.data.playNoteAnimation
        ] as const;
      
        return new ctor(...args);
      };

      case InteractionMode.Selecting:
        return new SelectingToolHandler(
          this.data.canvas,
          this.data.config,
          this.data.scroll,
          this.data.grid,
          this.data.store,
          controller,
          this.data.noteManager,
          this.data.requestRedraw
        );

      case InteractionMode.SelectedIdle: {
        const { global: { noteToolMode } } = getUserConfig();
      
        const ctor = noteToolMode === 'express'
          ? ExpressSelectedIdleToolHandler
          : SelectedIdleToolHandler;
      
        const args = [
          this.data.canvas,
          this.data.config,
          this.data.scroll,
          this.data.noteManager,
          this.data.store,
          this.data.grid,
          this.data.requestRedraw,
          () => this.data.sequencerContext.getId(),
          controller,
          this.data.cursorController,
          this.data.setClipboard,
          this.data.getClipboard
        ] as const;

        return new ctor(...args);
      };

      case InteractionMode.Pasting:
        return new PastingToolHandler(
          this.data.canvas,
          this.data.config,
          this.data.scroll,
          this.data.store,
          this.data.grid,
          this.data.requestRedraw,
          () => this.data.sequencerContext.getId(),
          controller,
          this.data.cursorController,
          this.data.getClipboard,
        );

      case InteractionMode.Dragging:
        return new DraggingToolHandler(
          this.data.canvas,
          this.data.config,
          this.data.scroll,
          this.data.store,
          this.data.noteManager,
          this.data.grid,
          this.data.requestRedraw,
          controller,
          this.data.cursorController,
          () => this.data.sequencerContext.getId()
        );

      case InteractionMode.Sizing:
        return new SizingToolHandler(
          this.data.canvas,
          this.data.config,
          this.data.scroll,
          this.data.store,
          this.data.noteManager,
          this.data.grid,
          this.data.requestRedraw,
          controller,
          this.data.cursorController,
          () => this.data.sequencerContext.getId()
        );
        
      default:
        return {};
    }
  }

  public destroy(): void {
    this.activeHandler?.onExit?.();
    this.activeHandler = null;
  }  
}
