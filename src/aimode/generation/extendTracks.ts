// src/aimode/generation/extendTracks.ts

import { getSequencers } from '../../setup/sequencers.js';
import { getStartBeat } from '../ExtendMode.js';
import { extendTracks } from '../clients/OpenAIService.js';
import {
  sequencersToTrackMaps,
  sliceTracksMaps,
  mergeTracksMaps
} from '../helpers/trackHelpers.js';
import { getMaxBeatsContext, getExtendBeatsAmount } from '../aiConfig.js';
import { drawMiniContour, drawGlobalMiniContour } from '../../sequencer/grid/drawing/mini-contour.js';
import { updateTotalMeasures, getTimeSignature } from '../../sequencer/transport.js';
import { TrackTuple } from '../../sequencer/interfaces/TrackTuple.js';
import { Track } from '../../sequencer/interfaces/Track.js'

export async function extendTracksWithAI(): Promise<void> {
  const workingModal = document.getElementById('ai-working-modal') as HTMLElement | null;
  if (!workingModal) return;
  workingModal.classList.remove('hidden');

  try {
    const allSequencers = getSequencers();

    const selectedIndices: number[] = Array.from(
      document.querySelectorAll<HTMLInputElement>('#extend-track-checkboxes input[type="checkbox"]:checked')
    ).map(cb => parseInt(cb.dataset.index ?? '0', 10));

    if (selectedIndices.length === 0) {
      console.warn('No tracks selected for AI extension.');
      workingModal.classList.add('hidden');
      return;
    }

    const selectedSequencers = selectedIndices.map(i => allSequencers[i]);
    const startBeat = getStartBeat();
    const contextStart = Math.max(0, startBeat - getMaxBeatsContext());
    const contextEnd = startBeat;

    const trackMaps: TrackTuple[] = sequencersToTrackMaps(selectedSequencers);
    const context: TrackTuple[] = sliceTracksMaps(trackMaps, contextStart, contextEnd);
    
    // Convert context (TrackTuple[]) into proper Track[] for extendTracks
    const objectContext: Track[] = context.map(track => ({
      n: track.n.map(noteTuple => ({
        pitch: noteTuple[0],
        start: noteTuple[1],
        duration: noteTuple[2],
      }))
    }));

    const aiResponseTracks: Track[] = await extendTracks(objectContext, getExtendBeatsAmount());
    console.log('🧠 AI Extension Result:', aiResponseTracks);
    
    // Convert the AI object-based tracks to tuple-based tracks
    const aiResponse: TrackTuple[] = aiResponseTracks.map(track => ({
      n: track.n.map(note => [note.pitch, note.start, note.duration])
    }));
    
    if (!aiResponse || aiResponse.length !== selectedSequencers.length) {
      throw new Error('AI response did not return expected number of tracks.');
    }
    
    const merged: TrackTuple[] = mergeTracksMaps(trackMaps, aiResponse);
    
    const allMergedBeats = merged.flatMap(t => t.n.map(n => n[1] + n[2]));
    const maxBeat = Math.max(...allMergedBeats);
    const newTotalMeasures = Math.ceil(maxBeat / getTimeSignature());

    updateTotalMeasures(newTotalMeasures);

    allSequencers.forEach((seq, i) => {
      seq.updateTotalMeasures(newTotalMeasures);

      const selectedIndex = selectedIndices.indexOf(i);
      if (selectedIndex !== -1) {
        const trackMap = merged[selectedIndex];
        seq.updateNotesFromTrackMap(trackMap);
      }

      seq.grid?.scheduleRedraw();

      const miniCanvas = seq.container.querySelector('canvas.mini-contour') as HTMLCanvasElement | null;
      if (miniCanvas) {
        drawMiniContour(miniCanvas, seq.notes, seq.config, seq.colorIndex);
      }
    });

    const globalMiniCanvas = document.getElementById('global-mini-contour') as HTMLCanvasElement | null;
    if (globalMiniCanvas) {
      drawGlobalMiniContour(globalMiniCanvas, allSequencers);
    }

    console.log('🎼 Sequencers updated with AI-generated continuation.');
    console.log(`🎼 Total measures extended to ${newTotalMeasures} based on AI content.`);

    document.getElementById('ai-extend-modal')?.classList.add('hidden');
    workingModal.classList.add('hidden');

  } catch (err) {
    console.error('Error during AI extension:', err);

    workingModal.classList.add('hidden');

    const errorModal = document.getElementById('ai-generation-failed-modal') as HTMLElement | null;
    if (errorModal) {
      errorModal.classList.remove('hidden');

      const okButton = document.getElementById('generation-failed-ok') as HTMLElement | null;
      okButton?.addEventListener('click', () => {
        errorModal.classList.add('hidden');
      }, { once: true });
    }
  }
}
