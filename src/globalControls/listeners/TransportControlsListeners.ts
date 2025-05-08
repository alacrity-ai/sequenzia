// src/globalControls/listeners/TransportControlsListeners.ts

import type { ListenerAttachment } from '@/userSettings/interfaces/ListenerAttachment.js';

export function attachTransportListeners(container: HTMLElement): ListenerAttachment {
  const playBtn = container.querySelector('#play-button');
  const stopBtn = container.querySelector('#stop-button');
  const recordBtn = container.querySelector('#record-button');

  const refreshUI = () => {
    // TODO: Update transport state (playing, stopped, etc.)
  };

  const handlePlay = () => {
    // TODO: Toggle playback
  };

  const handleStop = () => {
    // TODO: Stop playback
  };

  const handleRecord = () => {
    // TODO: Start recording
  };

  playBtn?.addEventListener('click', handlePlay);
  stopBtn?.addEventListener('click', handleStop);
  recordBtn?.addEventListener('click', handleRecord);

  return {
    detach: () => {
      playBtn?.removeEventListener('click', handlePlay);
      stopBtn?.removeEventListener('click', handleStop);
      recordBtn?.removeEventListener('click', handleRecord);
    },
    refreshUI
  };
}
