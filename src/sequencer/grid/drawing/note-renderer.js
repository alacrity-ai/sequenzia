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

      const color = getNoteColor(previewNote, { getPitchClass, getTrackColor });

      ctx.fillStyle = colorToRgba(color, 0.4);
      drawRoundedRect(ctx, x, y, w, h);
      ctx.fill();
    }
  }
}

function colorToRgba(color, alpha = 1.0) {
  if (color.startsWith('#')) {
    const bigint = parseInt(color.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (color.startsWith('hsl(')) {
    // Convert hsl(h, s%, l%) to rgba
    const [h, s, l] = color
      .slice(4, -1)
      .split(',')
      .map(part => parseFloat(part));
    const [r, g, b] = hslToRgb(h, s / 100, l / 100);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Default fallback
  return color;
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];

  if (0 <= h && h < 60)      [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180)[r, g, b] = [0, c, x];
  else if (180 <= h && h < 240)[r, g, b] = [0, x, c];
  else if (240 <= h && h < 300)[r, g, b] = [x, 0, c];
  else if (300 <= h && h < 360)[r, g, b] = [c, 0, x];

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}
