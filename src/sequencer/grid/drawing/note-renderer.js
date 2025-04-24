// sequencer/grid/drawing/note-renderer.js

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
  PITCH_COLOR_MAP,
  drawRoundedRect
}) {
  // Set overscan compensation
  const overscanBeats = 2;

  for (const note of notes) {
    if (note.start + note.duration < visibleStartBeat - overscanBeats || note.start > visibleEndBeat) continue;

    const x = note.start * cellWidth;
    const y = getPitchRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;
    const baseColor = PITCH_COLOR_MAP[getPitchClass(note.pitch)] || '#999';

    // Shadowed body
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    
    // 🎨 Highlighted notes get a rich blue fill
    if (highlightedNotes.includes(note)) {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.6)'; // blue-400 fill with alpha
    } else {
      ctx.fillStyle = baseColor;
    }
    
    drawRoundedRect(ctx, x, y, w, h);
    ctx.fill();
    

    // Gloss overlay
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
    
      if (isSelected) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 1.0)'; // blue-500
      } else if (isHovered) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'; // hovered = black
      } else if (isHighlighted) {
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)'; // light-blue stroke for selection preview
      }
    
      drawRoundedRect(ctx, x, y, w, h);
      ctx.stroke();
    }    
  }

  if (previewNotes) {
    for (const previewNote of previewNotes) {
      const x = previewNote.start * cellWidth;
      const y = getPitchRow(previewNote.pitch) * cellHeight;
      const w = previewNote.duration * cellWidth;
      const h = cellHeight - 1;
      const color = PITCH_COLOR_MAP[getPitchClass(previewNote.pitch)] || '#999';
  
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
