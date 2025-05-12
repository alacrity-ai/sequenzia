// src/components/sequencer/factories/SequencerFactory.ts

import Sequencer from '@/components/sequencer/sequencer.js';
import { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import { registerSequencer, getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { drawMiniContour } from '@/components/sequencer/renderers/drawMiniContour.js';
import { getAudioContext as audioCtx, getMasterGain } from '@/sounds/audio/audio.js';
import { recordDiff } from '@/appState/appState.js';
import { createDeleteSequencerDiff, createReverseDeleteSequencerDiff } from '@/appState/diffEngine/types/sequencer/deleteSequencer.js';
import { SEQUENCER_CONFIG as config } from '@/components/sequencer/constants/sequencerConstants.js';

import type { SequencerState } from '@/appState/interfaces/AppState.js';

export function createSequencer(wrapper: HTMLElement, initialState: SequencerState, newId: number): { seq: Sequencer } {
  const mergedConfig = { id: newId, ...config };
  const instrument = initialState.instrument || 'sf2/fluidr3-gm/acoustic_grand_piano';

  const seq = new Sequencer(wrapper, mergedConfig, audioCtx(), getMasterGain(), instrument, true, newId);
  seq.id = newId;
  seq.colorIndex = newId;
  seq.mute = false;
  seq.solo = false;
  seq.volume = 100 / 127;

  if (initialState.notes && seq.matrix) {
    seq.matrix.setNotes(initialState.notes);
  }

  if (initialState) {
    seq.setState({
      notes: initialState.notes,
      config: {},
      instrument: initialState.instrument,
      volume: initialState.volume,
      pan: initialState.pan,
    });
  }

  const mini = wrapper.querySelector('canvas.mini-contour') as HTMLCanvasElement;
  seq.miniContour = mini;
  drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);

  seq.updateTrackLabel();
  seq.initInstrument();

  registerSequencer(seq.id, seq);
  PlaybackEngine.getInstance().addSequencer(seq);

  return { seq };
}

export function destroyAllSequencers(): void {
  // This is correct. The diff actions themselves will call seq.destroy and remove sequencers from the global array
  for (const seq of getSequencers().slice()) {
    recordDiff(
      createDeleteSequencerDiff(
        seq.id,
        seq.instrumentName,
        seq.matrix?.getNoteManager().getAll() ?? [],
        seq.volume,
        seq.pan
      ),
      createReverseDeleteSequencerDiff(
        seq.id,
        seq.instrumentName,
        seq.matrix?.getNoteManager().getAll() ?? [],
        seq.volume,
        seq.pan
      )
    );
  }
}
