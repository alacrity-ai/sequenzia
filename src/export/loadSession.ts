// src/export/loadSession.ts

import { updateTempo, updateTimeSignature, updateTotalMeasures, getTempo, getTotalMeasures } from '../sequencer/transport.js';
import { destroyAllSequencers, sequencers } from '../setup/sequencers.js';
import { collapseAllSequencers } from '../helpers.js';
import { refreshGlobalMiniContour } from '../sequencer/grid/drawing/mini-contour.js';
import { drawGlobalPlayhead } from '../playhead/global-playhead.js';
import { recordDiff } from '../appState/appState.js';
import { createReverseCreateSequencerDiff } from '../appState/diffEngine/types/sequencer/createSequencer.js';
import { createCheckpointDiff, createReverseCheckpointDiff } from '../appState/diffEngine/types/internal/checkpoint.js';
import { TrackData } from '../sequencer/interfaces/Track.js';
import { GlobalConfig } from '../userconfig/interfaces/GlobalConfig.js';

/**
 * Loads the given tracks and globalConfig into the app state, replacing existing session.
 * @param tracks - The imported track data
 * @param globalConfig - The imported global configuration
 */
export function loadSession(tracks: TrackData[], globalConfig: GlobalConfig): void {
  // Update global tempo, time signature, measures
  updateTempo(globalConfig.bpm);
  updateTimeSignature(globalConfig.beatsPerMeasure);
  updateTotalMeasures(globalConfig.totalMeasures);

  // Update UI footer inputs if present
  const tempoInput = document.getElementById('tempo-input') as HTMLInputElement | null;
  if (tempoInput) tempoInput.value = String(getTempo());

  const measuresInput = document.getElementById('measures-input') as HTMLInputElement | null;
  if (measuresInput) measuresInput.value = String(getTotalMeasures());

  // Destroy current sequencers
  destroyAllSequencers();

  // Create new sequencers from imported tracks
  for (const [i, state] of tracks.entries()) {
    const id = i;
    const instrument = state.instrument || 'sf2/fluidr3-gm/acoustic_grand_piano';
    const notes = state.notes || [];
    const volume = state.volume
    const pan = state.pan
    recordDiff(
        {
          type: 'CREATE_SEQUENCER',
          id,
          instrument,
          notes: structuredClone(notes),
          volume: volume,
          pan: pan,
          config: {
            ...(state.config || {})
          },
        },
        createReverseCreateSequencerDiff(id)
      );      
  }  

  recordDiff(
    createCheckpointDiff('Session Loaded'),
    createReverseCheckpointDiff('Session Loaded')
  );

  collapseAllSequencers();
  const canvas = document.getElementById('global-mini-contour') as HTMLCanvasElement;
  if (canvas) refreshGlobalMiniContour(canvas, sequencers);
  drawGlobalPlayhead(0);
}
