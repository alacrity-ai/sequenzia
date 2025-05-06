// sequencer/clipboard.js — shared clipboard across sequencers

import { pitchToMidi } from '../sounds/audio/pitch-utils.js';
import { Clipboard } from './interfaces/Clipboard.js';
import { Note } from '../shared/interfaces/Note.js';

// Shared clipboard instance
let clipboard: Clipboard = {
  notes: [],
  anchorBeat: 0,
  anchorMidi: 0,
};

/**
 * Sets the clipboard with the given notes.
 * Uses the first note as the anchor.
 */
export function setClipboard(notes: Note[]): void {
  if (notes.length === 0) return;

  const anchor = notes[0];
  const anchorBeat = anchor.start;
  const anchorMidi = pitchToMidi(anchor.pitch) ?? 0;

  clipboard = {
    notes: notes.map((n: Note) => ({
      pitch: n.pitch,
      start: n.start,
      duration: n.duration,
      velocity: n.velocity ?? 100,
    })),
    anchorBeat,
    anchorMidi,
  };
}

/**
 * Returns the current clipboard contents.
 */
export function getClipboard(): Clipboard {
  return clipboard;
}
