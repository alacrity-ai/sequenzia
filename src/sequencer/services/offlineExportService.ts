import { loadInstrument } from '../../sounds/instrument-loader.js';
import { pitchToMidi } from '../../shared/utils/musical/noteUtils.js';
import { getTempo } from '../transport.js';
import type { Note } from '../../shared/interfaces/Note.js';

export async function exportNotesToOffline(
  instrumentName: string,
  context: AudioContext,
  destination: AudioNode,
  notes: Note[],
  volume: number,
  pan: number,
  signal?: AbortSignal
): Promise<void> {
  if (!notes || notes.length === 0) return;

  const beatToSec = 60 / getTempo();

  if (signal?.aborted) {
    console.log('ABORTED Before loading instrument');
    return;
  }

  const instrument = await loadInstrument(instrumentName, context, destination, volume, pan);

  if (signal?.aborted) {
    console.log('ABORTED After loading instrument');
    return;
  }

  for (const note of notes) {
    if (signal?.aborted) {
      console.log('ABORTED During note export');
      return;
    }

    const rawStartSec = note.start * beatToSec;
    const startSec = Math.max(0.01, rawStartSec);
    const durationSec = note.duration * beatToSec;
    const velocity = note.velocity ?? 100;
    const midi = pitchToMidi(note.pitch);
    if (midi == null) continue;

    const parts = instrumentName.split('/');
    const library = parts.length >= 3 ? parts[1] : parts[0];

    const mappedNote = (library === 'drummachines' && instrument.__midiMap)
      ? instrument.__midiMap.get(midi) ?? midi
      : midi;

    try {
      instrument.start({
        note: mappedNote,
        duration: durationSec,
        velocity,
        time: startSec,
        loop: false,
      });
    } catch (err) {
      console.warn(`[exportNotesToOffline] Failed to start note:`, note, err);
    }
  }
}
