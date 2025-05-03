// src/sequencer/matrix/renderers/NoteRenderer.ts

import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { NoteManager } from '../notes/NoteManager.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import type { TrackedNote } from '../interfaces/TrackedNote.js';
import { drawRoundedRect } from '../utils/roundedRect.js';
import { createVisibleNotesFilter } from '../utils/createNoteVisibilityFilter.js'
import { pitchToRowIndex } from '../utils/pitchToRowIndex.js';

export class NoteRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig,
    private noteManager: NoteManager,
    private interactionStore: InteractionStore
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      layout: { baseCellWidth, verticalCellRatio, labelWidth, headerHeight },
      behavior: { zoom },
    } = this.config;

    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();

    const canvas = ctx.canvas as HTMLCanvasElement;
    const notes: TrackedNote[] = this.noteManager.getTrackedNotes(this.interactionStore);

    const isVisible = createVisibleNotesFilter(scrollX, scrollY, this.config, canvas);

    ctx.save();
    ctx.translate(labelWidth - scrollX, headerHeight - scrollY);

    const filterVisible = createVisibleNotesFilter(scrollX, scrollY, this.config, canvas);
    const visibleNotes = filterVisible(notes);
    
    for (const { note, state } of visibleNotes) {
      const row = pitchToRowIndex(note.pitch, this.config.layout.lowestMidi, this.config.layout.totalRows)!;
      const y = row * cellHeight;
      const x = note.start * cellWidth;
      const w = note.duration * cellWidth;
      const h = cellHeight;
    
      ctx.fillStyle = state.selected
        ? '#f0f'
        : state.highlighted
        ? '#0f0'
        : '#09f';
    
      drawRoundedRect(ctx, x, y, w, h, 4);
      ctx.fill();
    }

    ctx.restore();
  }
}
