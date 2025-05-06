// src/sequencer/matrix/rendering/NotePreviewRenderer.ts

import { drawRoundedRect } from '../utils/roundedRect.js';
import { noteToMidi } from '../../../shared/utils/musical/noteUtils.js';

import type { InteractionStore } from '../input/stores/InteractionStore.js';
import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';

export class NotePreviewRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig,
    private store: InteractionStore,
    private getNoteDuration: () => number
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      layout: { baseCellWidth, verticalCellRatio, labelWidth, headerHeight, lowestMidi, highestMidi },
      behavior: { zoom },
    } = this.config;

    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    ctx.save();
    ctx.translate(labelWidth - this.scroll.getX(), headerHeight - this.scroll.getY());
    ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';

    // 🎯 Draw clipboard preview notes if present
    const previewNotes = this.store.getPreviewNotes();
    if (previewNotes.length > 0) {
      const totalRows = highestMidi - lowestMidi + 1;
    
      for (const note of previewNotes) {
        const midi = noteToMidi(note.pitch);
        if (midi === null) continue;
    
        const row = totalRows - 1 - (midi - lowestMidi); // ← FIXED
        const px = note.start * cellWidth;
        const py = row * cellHeight;
        const width = note.duration * cellWidth;
    
        drawRoundedRect(ctx, px, py, width, cellHeight, 3);
        ctx.fill();
      }
    
      ctx.restore();
      return;
    }    

    // ✏️ Fallback: draw a single snapped note (DefaultNoteToolHandler)
    const snapped = this.store.getSnappedCursorGridPosition();
    if (!snapped) {
      ctx.restore();
      return;
    }

    const duration = this.getNoteDuration();
    const px = snapped.x * cellWidth;
    const py = snapped.y * cellHeight;
    const noteWidth = cellWidth * duration;

    drawRoundedRect(ctx, px, py, noteWidth, cellHeight, 3);
    ctx.fill();

    ctx.restore();
  }
}
