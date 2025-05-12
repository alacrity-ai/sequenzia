import Sequencer from '@/components/sequencer/sequencer.js';
import { SEQUENCER_CONFIG as defaultConfig } from '@/components/sequencer/constants/sequencerConstants.js';

import type { TrackData } from '@/components/sequencer/interfaces/Track.js';

/**
 * Internal counter to ensure export sequencer IDs are unique per export pass.
 */
let exportSequencerIdCounter = 0;

/**
 * Creates a headless Sequencer for offline export purposes.
 * Pure, non-registered instance.
 *
 * @param offlineCtx - The OfflineAudioContext to render into.
 * @param track - The TrackData payload.
 * @returns A fully-initialized Sequencer.
 */
export function createExportSequencer(
  offlineCtx: OfflineAudioContext,
  track: TrackData
): Sequencer {
  const id = exportSequencerIdCounter++;

  const mergedConfig = { id, ...defaultConfig };
  const instrument = track.instrument || 'sf2/fluidr3-gm/acoustic_grand_piano';

  const seq = new Sequencer(
    null,
    mergedConfig,
    offlineCtx as any,
    offlineCtx.destination,
    instrument,
    true,
    id
  );

  seq.id = id;
  seq.colorIndex = id;
  seq.mute = false;
  seq.solo = false;
  seq.volume = track.volume ?? (100 / 127);
  seq.pan = track.pan ?? 0.0;

  if (track.notes && seq.matrix) {
    seq.matrix.setNotes(track.notes);
  }

  seq.setState({
    notes: track.notes,
    config: track.config || {},
    instrument: track.instrument,
    volume: track.volume,
    pan: track.pan,
  });

  seq.initInstrument();

  return seq;
}

/**
 * Resets the export ID counter.
 * Call this before starting a new export session.
 */
export function resetExportSequencerIds(): void {
  exportSequencerIdCounter = 0;
}
