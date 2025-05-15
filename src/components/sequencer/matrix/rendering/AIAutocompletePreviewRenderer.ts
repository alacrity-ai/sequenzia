// src/components/sequencer/matrix/rendering/AIAutocompletePreviewRenderer.ts

import { getAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { getAIIndicatorEnabled } from '@/components/userSettings/store/userConfigStore.js';
import { drawRoundedRect } from '../utils/roundedRect.js';
import { noteToMidi } from '@/shared/utils/musical/noteUtils.js';
import { getAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { drawAIIndicatorChevron } from '@/shared/ui/canvas/drawAIIndicatorChevron.js';

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

    // === Draw AI preview notes ===
    const previewNotes = getAIPreviewNotes();
    if (previewNotes.length > 0) {
      const totalRows = highestMidi - lowestMidi + 1;

      ctx.fillStyle = 'rgba(252, 159, 207, 0.4)';

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
    }

    ctx.restore(); // Exit scroll context before drawing viewport-pinned overlays

    if (getAIIndicatorEnabled()) {
      const targetBeat = getAutoCompleteTargetBeat();
      if (targetBeat !== null) {
        const {
          layout: { baseCellWidth, labelWidth, headerHeight },
          behavior: { zoom },
        } = this.config;

        const cellWidth = baseCellWidth * zoom;
        const chevronX = labelWidth - this.scroll.getX() + targetBeat * cellWidth;
        const chevronWidth = cellWidth * 0.5;
        const chevronHeight = 8;

        drawAIIndicatorChevron(ctx, chevronX, headerHeight, chevronWidth, chevronHeight, 'up');
      }
    }
  }
}