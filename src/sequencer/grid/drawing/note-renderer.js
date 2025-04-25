// sequencer/grid/drawing/note-renderer.js

import { getUserConfig } from '../../../userconfig/settings/userConfig.js';
import { NOTE_COLOR_SCHEMES } from './color-schemes/note-colors.js';

export function drawNotes(ctx, notes, {
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
  getTrackColor,  // ⬅️ required for some strategies
  drawRoundedRect
}) {
  const overscanBeats = 2;
  const { noteColorScheme } = getUserConfig();
  const getNoteColor = NOTE_COLOR_SCHEMES[noteColorScheme] || (() => '#999');

  for (const note of notes) {
    if (note.start + note.duration < visibleStartBeat - overscanBeats || note.start > visibleEndBeat) continue;

    const x = note.start * cellWidth;
    const y = getPitchRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;

    const baseColor = getNoteColor(note, { getPitchClass, getTrackColor });

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
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSelected
        ? 'rgba(59, 130, 246, 1.0)'
        : isHovered
          ? 'rgba(0, 0, 0, 0.8)'
          : 'rgba(96, 165, 250, 0.6)';
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

      const color = getNoteColor(previewNote, { getPitchClass, getTrackColor });

      ctx.fillStyle = hexToRgba(color, 0.4);
      drawRoundedRect(ctx, x, y, w, h);
      ctx.fill();
    }
  }
}


function hexToRgba(hex, alpha) {
  const bigint = parseInt(hex.slice(1), 16);
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
}
