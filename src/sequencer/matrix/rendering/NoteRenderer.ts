// src/sequencer/matrix/renderers/NoteRenderer.ts

import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { NoteManager } from '../notes/NoteManager.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import type { TrackedNote } from '../interfaces/TrackedNote.js';
import { drawRoundedRect } from '../utils/roundedRect.js';
import { createVisibleNotesFilter } from '../utils/createNoteVisibilityFilter.js'
import { noteToRowIndex, getPitchClassIndex } from '../../../shared/utils/musical/noteUtils.js';
import { NOTE_COLOR_SCHEMES } from './colors/noteColorSchemes.js';
import { getUserConfig } from '../../../userconfig/settings/userConfigStore.js';
import { getTrackColor } from './colors/helpers/getTrackColor.js';

export class NoteRenderer {
  constructor(
    private scroll: GridScroll,
    private config: GridConfig,
    private noteManager: NoteManager,
    private interactionStore: InteractionStore,
    private sequencerId: number
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      layout: { baseCellWidth, verticalCellRatio, labelWidth, headerHeight },
      behavior: { zoom },
    } = this.config;

    const { noteColorScheme } = getUserConfig().theme;
    const getNoteColor = NOTE_COLOR_SCHEMES[noteColorScheme] || (() => '#999');
    
    const noteColorContext = {
      getPitchClass: getPitchClassIndex,
      getTrackColor: () => getTrackColor(this.sequencerId),
    };

    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();

    const canvas = ctx.canvas as HTMLCanvasElement;
    const notes: TrackedNote[] = this.noteManager.getTrackedNotes(this.interactionStore);

    ctx.save();
    ctx.translate(labelWidth - scrollX, headerHeight - scrollY);

    const filterVisible = createVisibleNotesFilter(scrollX, scrollY, this.config, canvas);
    const visibleNotes = filterVisible(notes);
    
    for (const { note, state } of visibleNotes) {
      const row = noteToRowIndex(note.pitch, this.config.layout.lowestMidi, this.config.layout.highestMidi)!;
      const y = row * cellHeight;
      const x = note.start * cellWidth;
      const w = note.duration * cellWidth;
      const h = cellHeight;
    
      const baseColor = getNoteColor(note, noteColorContext);
    
      // Fill color (base or dimmed depending on state)
      ctx.fillStyle = baseColor;
      drawRoundedRect(ctx, x, y, w, h, 4);
      ctx.fill();
    
      // Interaction outlines
      if (state.selected || state.hovered || state.highlighted) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = state.selected
          ? '#ffffff'           // Selected: white outline
          : state.hovered
          ? '#ff9933'           // Hovered: orange outline
          : '#33ff99';          // Highlighted: cyan/green outline
    
        drawRoundedRect(ctx, x, y, w, h, 4);
        ctx.stroke();
      }
    }    

    ctx.restore();
  }
}
