// src/sounds/utils/startInstrumentNote.ts
import type { Instrument } from '../interfaces/Instrument.js';

export interface StartInstrumentNoteOptions {
  instrument: Instrument;
  midi: number;
  time: number;
  duration: number;
  velocity: number;
}

export function startInstrumentNote({
  instrument,
  midi,
  time,
  duration,
  velocity
}: StartInstrumentNoteOptions): void {
  const resolved = instrument.__midiMap?.get(midi) ?? midi;

  if (!instrument?.start) {
    console.warn('[startInstrumentNote] Instrument missing start() method');
    return;
  }

  try {
    instrument.start({
      note: resolved,
      time,
      duration,
      velocity
    });
  } catch (err) {
    console.warn('[startInstrumentNote] Failed to start instrument note', { midi, resolved, err });
  }
}
