import { getSequencers } from '../../setup/sequencers.js';
import { getStartBeat } from '../ExtendMode.js'; // assumes it's exported from setupExtendModeUI
import { extendTracks } from '../clients/OpenAIService.js';
import {
  sequencersToTrackMaps,
  sliceTracksMaps,
  mergeTracksMaps
} from '../helpers/trackHelpers.js';
import { config } from '../../setup/sequencers.js';
import { getMaxBeatsContext, getExtendBeatsAmount } from '../aiConfig.js';
import { drawMiniContour, drawGlobalMiniContour } from '../../sequencer/mini-contour.js';
import { updateMeasuresInput } from '../../sequencer/ui.js';
import { updateTotalMeasures, getTimeSignature } from '../../sequencer/transport.js';

export async function extendTracksWithAI() {
    const workingModal = document.getElementById('ai-working-modal');
    workingModal.classList.remove('hidden');
  
    try {
      const allSequencers = getSequencers();
  
      const selectedIndices = Array.from(
        document.querySelectorAll('#extend-track-checkboxes input[type="checkbox"]:checked')
      ).map(cb => parseInt(cb.dataset.index, 10));
  
      if (selectedIndices.length === 0) {
        console.warn('No tracks selected for AI extension.');
        workingModal.classList.add('hidden');
        return;
      }
  
      const selectedSequencers = selectedIndices.map(i => allSequencers[i]);
      const startBeat = getStartBeat();
      const contextStart = Math.max(0, startBeat - getMaxBeatsContext());
      const contextEnd = startBeat;
  
      const trackMaps = sequencersToTrackMaps(selectedSequencers);
      const context = sliceTracksMaps(trackMaps, contextStart, contextEnd);
  
      const aiResponse = await extendTracks(context, getExtendBeatsAmount());
      console.log('🧠 AI Extension Result:', aiResponse);
  
      if (!aiResponse || aiResponse.length !== selectedSequencers.length) {
        throw new Error('AI response did not return expected number of tracks.');
      }
  
      const merged = mergeTracksMaps(trackMaps, aiResponse);
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
  
        const miniCanvas = seq.container.querySelector('canvas.mini-contour');
        if (miniCanvas) {
          drawMiniContour(miniCanvas, seq.notes, seq.config, seq.colorIndex);
        }
      });
  
      const globalMiniCanvas = document.getElementById('global-mini-contour');
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
  
      const errorModal = document.getElementById('ai-generation-failed-modal');
      errorModal.classList.remove('hidden');
  
      const okButton = document.getElementById('generation-failed-ok');
      okButton.addEventListener('click', () => {
        errorModal.classList.add('hidden');
      }, { once: true });
    }
  }
  
