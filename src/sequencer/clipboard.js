// sequencer/clipboard.js — shared clipboard across sequencers

import { pitchToMidi, midiToPitch, getTotalBeats } from '../helpers.js';

let clipboard = {
    notes: [],
    anchorBeat: 0,
    anchorMidi: 0
  };
  
  export function setClipboard(notes) {
    if (notes.length === 0) return;
  
    const anchor = notes[0]; // for reference origin
    const anchorBeat = anchor.start;
    const anchorMidi = pitchToMidi(anchor.pitch);
  
    clipboard = {
      notes: notes.map(n => ({
        pitch: n.pitch,
        start: n.start,
        duration: n.duration
      })),
      anchorBeat,
      anchorMidi
    };
  }
  
  export function getClipboard() {
    return clipboard;
  }
  