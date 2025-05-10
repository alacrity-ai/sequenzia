// src/shared/interfaces/MidiNoteMap.ts

/**
 * Represents a MIDI note map indicating whether each MIDI pitch (0–127) is in the key.
 */
export interface MidiNoteMap extends Map<number, boolean> {}
