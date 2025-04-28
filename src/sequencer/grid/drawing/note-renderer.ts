// src/sequencer/grid/drawing/note-renderer.ts

import { getUserConfig } from '../../../userconfig/settings/userConfig.js';
import { NOTE_COLOR_SCHEMES } from './color-schemes/note-colors.js';
import { colorToRgba } from './utility/colorConversion.js';
import { Note } from '../../interfaces/Note.js';
import { NoteContext } from '../../grid/drawing/color-schemes/note-colors.js';

interface DrawNotesOptions {
  previewNotes?: Note[] | null;
  hoveredNote?: Note | null;
  selectedNote?: Note | null;
  selectedNotes?: Note[];
  highlightedNotes?: Note[];
  cellWidth: number;
  cellHeight: number;
  visibleStartBeat: number;
  visibleEndBeat: number;
  getPitchRow: (pitch: string) => number;
  getPitchClass?: (pitch: string) => string;
  getTrackColor?: (trackId: any) => string; // kept generic 'any' for now
  drawRoundedRect: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) => void;
}

export function drawNotes(
  ctx: CanvasRenderingContext2D,
  notes: Note[],
  {
    previewNotes = null,
    hoveredNote,
    selectedNote,
    selectedNotes = [],
    highlightedNotes = [],
    cellWidth,
    cellHeight,
    visibleStartBeat,
    visibleEndBeat,
    getPitchRow,
    getPitchClass,
    getTrackColor,
    drawRoundedRect
  }: DrawNotesOptions
): void {
  const overscanBeats = 2;
  const { noteColorScheme } = getUserConfig();
  const getNoteColor = NOTE_COLOR_SCHEMES[noteColorScheme] || (() => '#999');

  for (const note of notes) {
    if (note.start + note.duration < visibleStartBeat - overscanBeats || note.start > visibleEndBeat) continue;

    const x = note.start * cellWidth;
    const y = getPitchRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;

    const baseColor = getNoteColor(note, { getPitchClass, getTrackColor } as NoteContext);

    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = highlightedNotes.includes(note)
      ? 'rgba(96, 165, 250, 0.6)'
      : baseColor;

    drawRoundedRect(ctx, x, y, w, h);
    ctx.fill();

    const gloss = ctx.createLinearGradient(x, y, x, y + h);
    gloss.addColorStop(0, 'rgba(255,255,255,0.4)');
    gloss.addColorStop(0.2, 'rgba(255,255,255,0.15)');
    gloss.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = gloss;
    drawRoundedRect(ctx, x, y, w, h);
    ctx.fill();

    const isSelected = selectedNotes.includes(note);
    const isHovered = note === hoveredNote;
    const isHighlighted = highlightedNotes.includes(note);

    if (isSelected || isHovered || isHighlighted) {
      ctx.lineWidth = isSelected ? 3 : 2;

      ctx.strokeStyle = isSelected
        ? 'rgba(0, 255, 255, 1.0)'      // Bright cyan for selected
        : isHovered
          ? 'rgba(255, 255, 255, 0.9)'  // White for hover
          : 'rgba(255, 200, 50, 0.7)';  // Amber for highlighted

      drawRoundedRect(ctx, x, y, w, h);
      ctx.stroke();
    }
  }

  // === Preview Notes ===
  if (previewNotes) {
    for (const previewNote of previewNotes) {
      const x = previewNote.start * cellWidth;
      const y = getPitchRow(previewNote.pitch) * cellHeight;
      const w = previewNote.duration * cellWidth;
      const h = cellHeight - 1;

      const color = getNoteColor(previewNote, { getPitchClass, getTrackColor } as NoteContext);

      ctx.fillStyle = colorToRgba(color, 0.4);
      drawRoundedRect(ctx, x, y, w, h);
      ctx.fill();
    }
  }
}
