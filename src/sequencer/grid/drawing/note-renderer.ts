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

interface DrawOverlayOptions {
  previewNotes?: Note[] | null;
  hoveredNote?: Note | null;
  selectedNotes?: Note[];
  highlightedNotes?: Note[];
  cellWidth: number;
  cellHeight: number;
  getPitchRow: (pitch: string) => number;
  getPitchClass?: (pitch: string) => string;
  getTrackColor?: (trackId: any) => string;
  drawRoundedRect: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) => void;
}

export function drawOverlayNotes(
  ctx: CanvasRenderingContext2D,
  {
    previewNotes = null,
    hoveredNote,
    selectedNotes = [],
    highlightedNotes = [],
    cellWidth,
    cellHeight,
    getPitchRow,
    getPitchClass,
    getTrackColor,
    drawRoundedRect
  }: DrawOverlayOptions
): void {
  const { noteColorScheme } = getUserConfig();
  const getNoteColor = NOTE_COLOR_SCHEMES[noteColorScheme] || (() => '#999');

  const selectedSet = new Set(selectedNotes);
  const highlightedSet = new Set(highlightedNotes);

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

  // === Highlighted Fill Overlay ===
  for (const note of highlightedNotes) {
    const x = note.start * cellWidth;
    const y = getPitchRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;

    ctx.fillStyle = 'rgba(96, 165, 250, 0.6)'; // Blue overlay
    drawRoundedRect(ctx, x, y, w, h);
    ctx.fill();
  }

  // === Outlines ===
  const outlineSet = new Set([...selectedNotes, hoveredNote, ...highlightedNotes]);
  for (const note of outlineSet) {
    if (!note) continue;

    const x = note.start * cellWidth;
    const y = getPitchRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;

    const isSelected = selectedSet.has(note);
    const isHovered = note === hoveredNote;
    const isHighlighted = highlightedSet.has(note);

    ctx.lineWidth = isSelected ? 3 : 2;

    ctx.strokeStyle = isSelected
      ? 'rgba(0, 255, 255, 1.0)'      // Bright cyan
      : isHovered
        ? 'rgba(255, 255, 255, 0.9)'  // White
        : isHighlighted
          ? 'rgba(255, 200, 50, 0.7)' // Amber
          : 'rgba(255, 255, 255, 0.4)'; // Fallback (shouldn't hit)

    drawRoundedRect(ctx, x, y, w, h);
    ctx.stroke();
  }
}



export function drawNotes(
  ctx: CanvasRenderingContext2D,
  notes: Note[],
  {
    cellWidth,
    cellHeight,
    visibleStartBeat,
    visibleEndBeat,
    getPitchRow,
    getPitchClass,
    getTrackColor,
    drawRoundedRect
  }: Omit<DrawNotesOptions, 'previewNotes' | 'hoveredNote' | 'selectedNote' | 'selectedNotes' | 'highlightedNotes'>
): void {
  const overscanBeats = 2;
  const { noteColorScheme } = getUserConfig();
  const getNoteColor = NOTE_COLOR_SCHEMES[noteColorScheme] || (() => '#999');

  // === Shadow setup (done once) ===
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;

  // === Memoize pitch row lookups ===
  const pitchRowCache = new Map<string, number>();
  const getRow = (pitch: string): number => {
    if (!pitchRowCache.has(pitch)) {
      pitchRowCache.set(pitch, getPitchRow(pitch));
    }
    return pitchRowCache.get(pitch)!;
  };

  // const visibleNotes = notes.filter(
  //   (n) => n.start + n.duration >= visibleStartBeat - overscanBeats && n.start <= visibleEndBeat
  // );
  const visibleNotes = notes;

  for (const note of visibleNotes) {
    const x = note.start * cellWidth;
    const y = getRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;

    ctx.fillStyle = getNoteColor(note, { getPitchClass, getTrackColor } as NoteContext);
    drawRoundedRect(ctx, x, y, w, h);
    ctx.fill();
  }

  // === Gloss pass (optional) ===
  // This could be skipped if note count is high for even more performance
  ctx.shadowColor = 'transparent';

  for (const note of visibleNotes) {
    const x = note.start * cellWidth;
    const y = getRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;

    const gloss = ctx.createLinearGradient(x, y, x, y + h);
    gloss.addColorStop(0, 'rgba(255,255,255,0.4)');
    gloss.addColorStop(0.2, 'rgba(255,255,255,0.15)');
    gloss.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gloss;
    drawRoundedRect(ctx, x, y, w, h);
    ctx.fill();
  }
}

