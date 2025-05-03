// src/sequencer/matrix/input/interactions/PlaceNoteHandler.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { Note } from '../../../interfaces/Note.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import { getRelativeMousePos } from '../../utils/gridPosition.js';
import { getSnappedNotePosition } from '../../utils/snapPosition.js';
import { invertedRowToPitch } from '../../../../sounds/audio/pitch-utils.js';


export class PlaceNoteHandler implements GridInteractionHandler {
    constructor(
      private readonly scroll: GridScroll,
      private readonly config: GridConfig,
      private readonly store: InteractionStore,
      private readonly grid: GridSnappingContext,
      private readonly addNote: (note: Note) => void,
      private readonly requestRedraw: () => void
    ) {}
  
    public onEnter(): void {
      // Optional: change cursor/tool indicator
    }
  
    public onExit(): void {
      this.store.setHoveredNotePosition(null); // cleanup
      this.requestRedraw();
    }
  
    public onMouseMove(e: MouseEvent): void {
      const mouse = getRelativeMousePos(e, e.currentTarget as HTMLElement);
      const snap = this.grid.getSnapResolution();
      const triplet = this.grid.isTripletMode();
  
      const snapped = getSnappedNotePosition(mouse, this.scroll, this.config, snap, triplet);
      this.store.setHoveredNotePosition(snapped);
      this.requestRedraw();
    }
  
    public onMouseDown(e: MouseEvent): void {
        const hovered = this.store.getHoveredNotePosition?.();
        if (!hovered) return;
      
        const { layout } = this.config;
        const duration = this.grid.getNoteDuration();
        const pitch = invertedRowToPitch(hovered.y, layout.lowestMidi, layout.totalRows);
      
        if (!pitch) return;
      
        const newNote: Note = {
          start: hovered.x,
          duration,
          pitch,
          velocity: 100
        };
      
        this.addNote(newNote);
        this.requestRedraw();
      }
  
    public onMouseUp(_e: MouseEvent): void {}
  }
