// src/shared/stores/songInfoStore.ts

import { getMidiNoteMapForKey } from '@/shared/utils/musical/tonal/songKeyMidiMap.js';
import type { SongKey } from '@/shared/types/SongKey.ts';
import type { MidiNoteMap } from '@/shared/interfaces/MidiNoteMap.ts';

let currentMidiNoteMap: MidiNoteMap = getMidiNoteMapForKey('CM');
let keyGridHighlightingEnabled = true; // Highlights the grid according to the current song key selected
let snapToGridEnabled = true; // Snaps notes to the grid based on the rhythmic snap duration setting (Horizontal beat snapping)
let snapToInKeyEnabled = true; // Snaps notes to the nearest in-key note (Vertical note snapping)

export function isSnapToGridEnabled(): boolean {
  return snapToGridEnabled;
}

export function setSnapToGridEnabled(enabled: boolean): void {
  snapToGridEnabled = enabled;
}

export function isSnapToInKeyEnabled(): boolean {
  return snapToInKeyEnabled;
}

export function setSnapToInKeyEnabled(enabled: boolean): void {
  snapToInKeyEnabled = enabled;
}

export function isKeyGridHighlightingEnabled(): boolean {
  return keyGridHighlightingEnabled;
}

export function setKeyGridHighlightingEnabled(enabled: boolean): void {
  keyGridHighlightingEnabled = enabled;
}

export function getMidiNoteMap(): MidiNoteMap {
  return currentMidiNoteMap;
}

export function updateMidiNoteMap(newKey: SongKey): void {
  currentMidiNoteMap = getMidiNoteMapForKey(newKey);
}
