export function findNoteAt(x, y, notes, getPitchRow, cellHeight, cellWidth) {
    const row = Math.floor(y / cellHeight);
    const beat = x / cellWidth;
  
    return notes.find(n =>
      beat >= n.start &&
      beat < n.start + n.duration &&
      getPitchRow(n.pitch) === row
    );
  }
  