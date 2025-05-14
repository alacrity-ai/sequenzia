// src/components/sequencer/matrix/rendering/AIAutocompletePreviewRenderer.ts

import { drawRoundedRect } from '../utils/roundedRect.js';
import { noteToMidi } from '@/shared/utils/musical/noteUtils.js';
import { getAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';

import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';

export class AIAutocompletePreviewRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig
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
    ctx.fillStyle = 'rgba(255, 100, 180, 0.4)'; // Slightly different color to differentiate AI previews

    const previewNotes = getAIPreviewNotes();
    if (previewNotes.length > 0) {
      const totalRows = highestMidi - lowestMidi + 1;

      for (const note of previewNotes) {
        const midi = noteToMidi(note.pitch);
        if (midi === null) continue;

        const row = totalRows - 1 - (midi - lowestMidi);
        const px = note.start * cellWidth;
        const py = row * cellHeight;
        const width = note.duration * cellWidth;

        drawRoundedRect(ctx, px, py, width, cellHeight, 3);
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    ctx.restore();
  }
}
