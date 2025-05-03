// src/sequencer/matrix/input/stores/InteractionStore.ts
  
import { SnappedNotePosition } from '../../interfaces/SnappedNotePosition.js';

  export class InteractionStore {
    private hoveredNotePosition: SnappedNotePosition | null = null;
    private isOnScrollbar = false;

    public setHoveredNotePosition(pos: SnappedNotePosition | null): void {
      this.hoveredNotePosition = pos;
    }

  
    public getHoveredNotePosition(): SnappedNotePosition | null {
      return this.hoveredNotePosition;
    }
  
    public setIsOnScrollbar(isOnScrollbar: boolean): void {
      this.isOnScrollbar = isOnScrollbar;
    }

    public getIsOnScrollbar(): boolean {
      return this.isOnScrollbar;
    }

    public isOnNonGridElement(): boolean {
      // Will put other checks here later
      return this.getIsOnScrollbar();
    }

    // Placeholder for future expansion:
    // private isDragging = false;
    // private activeTool: 'select' | 'draw' | 'erase' | null = null;
  }
  
  /* Usage:
    // In GridRenderer.ts
    const hovered = this.interactionStore.getHoveredCell();

    // In MouseTracker.ts
    this.interactionStore.setHoveredCell({ x, y });
  */