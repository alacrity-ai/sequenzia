// src/shared/interfaces/Note.ts

export interface Note {
    pitch: string;    // E.g., "C4"
    start: number;    // Start time in beats
    duration: number; // Duration in beats
    velocity?: number; // Optional velocity value
  }
  