// src/sequencer/matrix/renderers/NoteRenderer.ts

import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { NoteManager } from '../notes/NoteManager.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import type { TrackedNote } from '../interfaces/TrackedNote.js';
import { drawRoundedRect } from '../utils/roundedRect.js';
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
      layout: { baseCellWidth, verticalCellRatio, labelWidth, lowestMidi },
      behavior: { zoom },
      totalMeasures,
      beatsPerMeasure
    } = this.config;

    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();

    const notes: TrackedNote[] = this.noteManager.getTrackedNotes(this.interactionStore);

    ctx.save();
    ctx.translate(labelWidth - scrollX, -scrollY);

    for (const { note, state } of notes) {
      const pitchIndex = pitchToRowIndex(note.pitch, lowestMidi);
      if (pitchIndex == null) continue;

      const x = note.start * cellWidth;
      const y = pitchIndex * cellHeight;
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
