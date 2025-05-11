// src/shared/stores/songInfoStore.ts

import { getMidiNoteMapForKey } from '@/shared/utils/musical/tonal/songKeyMidiMap.js';
import { loadJSON, saveJSON } from '@/shared/utils/storage/localStorage.js';
import type { SongKey } from '@/shared/types/SongKey.ts';
import type { MidiNoteMap } from '@/shared/interfaces/MidiNoteMap.ts';

// === Keys for localStorage
const KEY_GRID_HIGHLIGHT = 'grid-key-highlighting';
const KEY_SNAP_TO_GRID = 'grid-snap-enabled';
const KEY_SNAP_TO_IN_KEY = 'snap-to-in-key';

// === Defaults
const DEFAULT_SONG_KEY: SongKey = 'CM';

// === Initialization from storage
let keyGridHighlightingEnabled = loadJSON<boolean>(KEY_GRID_HIGHLIGHT) ?? false;
let snapToGridEnabled = loadJSON<boolean>(KEY_SNAP_TO_GRID) ?? true;
let snapToInKeyEnabled = loadJSON<boolean>(KEY_SNAP_TO_IN_KEY) ?? false;
let currentMidiNoteMap: MidiNoteMap = getMidiNoteMapForKey(DEFAULT_SONG_KEY);

// === Accessors & Mutators

export function isKeyGridHighlightingEnabled(): boolean {
  return keyGridHighlightingEnabled;
}

export function setKeyGridHighlightingEnabled(enabled: boolean): void {
  keyGridHighlightingEnabled = enabled;
  saveJSON(KEY_GRID_HIGHLIGHT, enabled);
}

export function isSnapToGridEnabled(): boolean {
  return snapToGridEnabled;
}

export function setSnapToGridEnabled(enabled: boolean): void {
  snapToGridEnabled = enabled;
  saveJSON(KEY_SNAP_TO_GRID, enabled);
}

export function isSnapToInKeyEnabled(): boolean {
  return snapToInKeyEnabled;
}

export function setSnapToInKeyEnabled(enabled: boolean): void {
  snapToInKeyEnabled = enabled;
  saveJSON(KEY_SNAP_TO_IN_KEY, enabled);
}

export function getMidiNoteMap(): MidiNoteMap {
  return currentMidiNoteMap;
}

export function updateMidiNoteMap(newKey: SongKey): void {
  currentMidiNoteMap = getMidiNoteMapForKey(newKey);
}
