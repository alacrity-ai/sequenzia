// sequencer/grid/drawing/resize-arrow.js

/**
 * Draws a resize handle (arrow) at the right edge of a note.
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw onto.
 * @param {Object} note - The note object { start, duration, pitch, id, etc. }.
 * @param {Object} options - Drawing options.
 * @param {number} options.cellWidth - Width of a beat (X scale).
 * @param {number} options.cellHeight - Height of a row (Y scale).
 * @param {Function} options.getPitchRow - Maps pitch string to row number.
 * @param {boolean} [options.isHovered=false] - Whether the arrow is hovered.
 */
export function drawResizeArrow(ctx, note, {
    cellWidth,
    cellHeight,
    getPitchRow,
    isHovered = false
  }) {
    const arrowSize = Math.min(10, cellHeight * 0.8);
    const padding = 6; // ⬅️ Increase padding to push the arrow further off the note edge
    const x = (note.start + note.duration) * cellWidth + padding;
    const y = getPitchRow(note.pitch) * cellHeight + (cellHeight - arrowSize) / 2;
  
    ctx.save();
  
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
  
    // Base arrow color
    ctx.fillStyle = isHovered
    ? 'rgba(0, 255, 255, 0.95)' // Bright cyan glow for hovered
    : 'rgba(255, 255, 255, 0.85)';
    
    ctx.beginPath();
    ctx.moveTo(x, y);                         // Top left
    ctx.lineTo(x + arrowSize, y + arrowSize / 2); // Tip to the right
    ctx.lineTo(x, y + arrowSize);              // Bottom left
    ctx.closePath();
    ctx.fill();
  
    // Glossy overlay
    const gloss = ctx.createLinearGradient(x, y, x, y + arrowSize);
    gloss.addColorStop(0, 'rgba(255,255,255,0.9)');
    gloss.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
  
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + arrowSize, y + arrowSize / 2);
    ctx.lineTo(x, y + arrowSize);
    ctx.closePath();
    ctx.fill();
  
    ctx.restore();
  }
  