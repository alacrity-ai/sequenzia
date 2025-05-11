// src/components/sequencer/matrix/interfaces/SnappedNotePosition.ts

export interface SnappedNotePosition {
  x: number; // precise beat position (e.g. 3.5 = halfway through 4th beat)
  y: number; // integer row
}
  