import { icon } from '@/shared/ui/primitives/createIconImg.js';
import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';

import {
  updateTempo,
  updateTimeSignature,
  updateTotalMeasures,
  setLoopEnabled
} from '@/shared/playback/transportService.js';
import { onStateUpdated } from '@/appState/onStateUpdated.js';

import type { PlaybackService } from '../services/PlaybackService.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { UserConfigModalController } from '@/components/userSettings/userConfig.js';
import type { SaveModalController } from '../modals/saveModal/saveModalController.js';
import type { LoadModalController } from '../modals/loadModal/loadModalController.js';
import type { AppState } from '@/appState/interfaces/AppState.js';

export function attachTransportListeners(
  container: HTMLElement,
  playbackService: PlaybackService,
  userConfigModalController: UserConfigModalController,
  saveModal: SaveModalController,
  loadModal: LoadModalController
): ListenerAttachment {
  const playBtn = container.querySelector('#play-button');
  const stopBtn = container.querySelector('#stop-button');
  const recordBtn = container.querySelector('#record-button');
  const loopToggle = container.querySelector('#loop-toggle') as HTMLInputElement | null;

  const tempoInput = container.querySelector('#tempo-input') as HTMLInputElement | null;
  const measuresInput = container.querySelector('#measures-input') as HTMLInputElement | null;
  const beatsInput = container.querySelector('#beats-per-measure-input') as HTMLInputElement | null;

  const saveBtn = container.querySelector('#save-button') as HTMLButtonElement | null;
  const loadBtn = container.querySelector('#load-button') as HTMLButtonElement | null;
  const configBtn = container.querySelector('#config-button') as HTMLButtonElement | null;

  const setPlayButtonState = (isPlaying: boolean) => {
    if (!playBtn) return;

    playBtn.classList.toggle('bg-blue-800', isPlaying);
    playBtn.classList.toggle('bg-blue-600', !isPlaying);

    const expectedIcon = isPlaying ? 'icon-pause' : 'icon-play';
    const expectedSrc = getAssetPath(`static/svg/${expectedIcon}.svg`);
    const existingIcon = playBtn.querySelector('img');

    if (existingIcon?.getAttribute('src') !== expectedSrc) {
      const newIcon = icon(expectedIcon, isPlaying ? 'Pause' : 'Play');
      if (existingIcon) {
        playBtn.replaceChild(newIcon, existingIcon);
      } else {
        playBtn.appendChild(newIcon);
      }
    }
  };

  const refreshUI = () => {
    setPlayButtonState(playbackService.isPlaying());
  };

  playbackService.setOnStopCallback(() => {
    setPlayButtonState(false);
  });

  const handlePlay = () => {
    const willBePlaying = !playbackService.isPlaying();
    playbackService.toggle();
    setPlayButtonState(willBePlaying);
  };

  const handleStop = () => {
    playbackService.stop();
    setPlayButtonState(false);
  };

  const handleRecord = () => {
    // TODO: implement recording logic
  };

  const handleTempoChange = () => {
    const value = tempoInput?.valueAsNumber;
    if (value && value >= 20 && value <= 300) {
      updateTempo(value, true);
    }
  };

  const handleMeasuresChange = () => {
    const value = measuresInput?.valueAsNumber;
    if (value && value >= 1 && value <= 1000) {
      updateTotalMeasures(value, true);
    }
  };

  const handleBeatsChange = () => {
    const value = beatsInput?.valueAsNumber;
    if (value && value >= 1 && value <= 16) {
      updateTimeSignature(value, true);
    }
  };

  onStateUpdated((state: AppState) => {
    if (tempoInput) tempoInput.value = String(state.tempo);
    if (measuresInput) measuresInput.value = String(state.totalMeasures);
    if (beatsInput) beatsInput.value = String(state.timeSignature[0]);
  });

  const handleLoopToggle = () => {
    setLoopEnabled(loopToggle?.checked ?? false);
  };

  const handleSave = () => {
    saveModal.show();
  };

  const handleLoad = () => {
    loadModal.show();
  };

  const handleConfigClick = () => {
    userConfigModalController.show();
  };

  // === Keyboard Shortcuts

  const handleSpacebar = (e: KeyboardEvent) => {
    const activeTag = (document.activeElement as HTMLElement)?.tagName;
    const isTypingContext = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

    if (e.key === ' ' && !isTypingContext) {
      e.preventDefault(); // Prevent default scroll

      if (e.shiftKey) {
        handleStop(); // SHIFT + Space
      } else {
        handlePlay(); // Regular Space
      }
    }
  };

  // Attach listeners
  playBtn?.addEventListener('click', handlePlay);
  stopBtn?.addEventListener('click', handleStop);
  recordBtn?.addEventListener('click', handleRecord);

  tempoInput?.addEventListener('change', handleTempoChange);
  measuresInput?.addEventListener('change', handleMeasuresChange);
  beatsInput?.addEventListener('change', handleBeatsChange);
  loopToggle?.addEventListener('change', handleLoopToggle);

  saveBtn?.addEventListener('click', handleSave);
  loadBtn?.addEventListener('click', handleLoad);
  configBtn?.addEventListener('click', handleConfigClick);

  window.addEventListener('keydown', handleSpacebar);

  return {
    detach: () => {
      playBtn?.removeEventListener('click', handlePlay);
      stopBtn?.removeEventListener('click', handleStop);
      recordBtn?.removeEventListener('click', handleRecord);

      tempoInput?.removeEventListener('change', handleTempoChange);
      measuresInput?.removeEventListener('change', handleMeasuresChange);
      beatsInput?.removeEventListener('change', handleBeatsChange);
      loopToggle?.removeEventListener('change', handleLoopToggle);

      saveBtn?.removeEventListener('click', handleSave);
      loadBtn?.removeEventListener('click', handleLoad);
      configBtn?.removeEventListener('click', handleConfigClick);

      window.removeEventListener('keydown', handleSpacebar);
    },
    refreshUI
  };
}
