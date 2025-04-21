export function drawNotes(ctx, notes, {
  previewNote,
  hoveredNote,
  selectedNote,
  cellWidth,
  cellHeight,
  visibleStartBeat,
  visibleEndBeat,
  getPitchRow,
  getPitchClass,
  PITCH_COLOR_MAP,
  drawRoundedRect
}) {
  for (const note of notes) {
    if (note.start + note.duration < visibleStartBeat || note.start > visibleEndBeat) continue;

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
    ctx.fillStyle = baseColor;
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

    if (note === hoveredNote || note === selectedNote) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = note === selectedNote ? 'blue' : 'black';
      drawRoundedRect(ctx, x, y, w, h);
      ctx.stroke();
    }
  }

  if (previewNote && !hoveredNote && !selectedNote) {
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

function hexToRgba(hex, alpha) {
  const bigint = parseInt(hex.slice(1), 16);
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
}
