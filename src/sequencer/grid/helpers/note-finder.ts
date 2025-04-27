// src/sequencer/grid/helpers/note-finder.ts

export function findNoteAt(
  x: number,
  y: number,
  notes: { pitch: string; start: number; duration: number }[],
  getPitchRow: (pitch: string) => number,
  cellHeight: number,
  cellWidth: number
): { pitch: string; start: number; duration: number } | undefined {
  const row = Math.floor(y / cellHeight);
  const beat = x / cellWidth;

  return notes.find(n =>
    beat >= n.start &&
    beat < n.start + n.duration &&
    getPitchRow(n.pitch) === row
  );
}
