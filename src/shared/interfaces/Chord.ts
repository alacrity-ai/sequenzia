// src/shared/interfaces/Chord.ts

export interface DetectedChord {
  name: string;           // e.g. "C major seventh"
  symbol: string;         // e.g. "Cmaj7/B"
  type: string;           // e.g. "major seventh"
  quality: string;        // e.g. "Major"
  notes: string[];        // e.g. ["B", "C", "E", "G"]
}
