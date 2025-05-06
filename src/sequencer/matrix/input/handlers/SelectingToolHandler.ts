// src/sequencer/matrix/input/handlers/SelectingToolHandler.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { NoteManager } from '../../notes/NoteManager.js';
import type { InteractionController } from '../interfaces/InteractionController.js';

import { getNotesInMarquee } from '../../utils/marqueeUtils.js';
import { InteractionMode } from '../interfaces/InteractionEnum.js';
import { getGridRelativeMousePos, getGridRelativeMousePosFromXY } from '../../utils/gridPosition.js';


export class SelectingToolHandler implements GridInteractionHandler {
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: GridConfig,
    private readonly scroll: GridScroll,
    private readonly grid: GridSnappingContext,
    private readonly store: InteractionStore,
    private readonly controller: InteractionController,
    private readonly noteManager: NoteManager,
    private readonly requestRedraw: () => void
  ) {}

  public onEnter(): void {
    const start = getGridRelativeMousePosFromXY(
        this.controller.getLastMouseX(), 
        this.controller.getLastMouseY(), 
        this.canvas,
        this.scroll,
        this.config
      );
    this.store.setMarqueeBox({
      startX: start.x,
      startY: start.y,
      currentX: start.x,
      currentY: start.y
    });
  }

  public onMouseMove(e: MouseEvent): void {
    const box = this.store.getMarqueeBox();
    if (!box) return;
  
    const local = getGridRelativeMousePos(e, this.canvas, this.scroll, this.config);
    box.currentX = local.x;
    box.currentY = local.y;
  
    this.store.setMarqueeBox({ ...box });
  
    // Update live highlight state
    const highlighted = getNotesInMarquee(
      this.noteManager.getAll(),
      box,
      this.scroll,
      this.config,
      this.grid
    );
    this.store.setHighlightedNotes(highlighted);
  
    this.requestRedraw();
  }  

  public onMouseUp(_e: MouseEvent): void {
    const box = this.store.getMarqueeBox();
    if (!box) {
      this.controller.transitionTo(InteractionMode.DefaultNoteTool);
      return;
    }
  
    const selected = getNotesInMarquee(
      this.noteManager.getAll(),
      box,
      this.scroll,
      this.config,
      this.grid
    );
  
    if (selected.length > 0) {
      this.store.clearHighlightedNotes();
      this.store.setSelectedNotes(selected);
      this.store.setMarqueeBox(null);
      this.controller.transitionTo(InteractionMode.SelectedIdle);
    } else {
      this.store.clearSelection();
      this.controller.transitionTo(InteractionMode.DefaultNoteTool);
    }
  } 

  public onMouseLeave(): void {
    this.store.clearHighlightedNotes();
    this.store.setMarqueeBox(null);
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }  

  public onExit(): void {
    this.store.clearHighlightedNotes();
    this.store.setMarqueeBox(null);
    this.requestRedraw();
  }  
}
