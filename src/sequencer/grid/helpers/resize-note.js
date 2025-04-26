export function isOnResizeHandle(ctx, note, mouseX, mouseY) {
    const cellWidth = ctx.getCellWidth();
    const cellHeight = ctx.getCellHeight();
    const getPitchRow = ctx.getPitchRow;
  
    const arrowSize = Math.min(10, cellHeight * 0.8);
    const padding = 6; // Match drawResizeArrow
  
    const x = (note.start + note.duration) * cellWidth + padding;
    const y = getPitchRow(note.pitch) * cellHeight + (cellHeight - arrowSize) / 2; 
 
    const hitPadding = 4; // 4px extra padding
    
    // Calculate hit box boundaries
    const left = x - hitPadding;
    const right = x + arrowSize + hitPadding;
    const top = y - hitPadding;
    const bottom = y + arrowSize + hitPadding;
    
    // Log detailed information about the hit test
    // Log if we hit or didn't hit
    if (mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom) {
        console.log('Hit resize handle!');
    } else {
        console.log('Missed resize handle.');
    }
    
    return (
      mouseX >= left &&
      mouseX <= right &&
      mouseY >= top &&
      mouseY <= bottom
    );
}