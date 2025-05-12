// src/components/topControls/components/keyboard/listeners/keyboardSideButtonListeners.ts

import { getKeyMap } from '@/components/topControls/components/keyboard/helpers/keys.js';
import { drawKeys } from '@/components/topControls/components/keyboard/renderers/renderer.js';
import { refreshInstrumentSelectorModal } from '@/components/sequencer/services/instrumentSelectorService.js';
import { setSideButtonActivated } from '@/shared/ui/helpers/setSideButtonActivated.js';
import { buildKeyToNoteMap } from '@/components/topControls/components/keyboard/helpers/buildKeyToNoteMap.js';
import {
  getCurrentOctave,
  setCurrentOctave,
  isKeyboardInputEnabled,
  setKeyboardInputEnabled,
  setKeyMapRef,
  getKeyboardInstrument
} from '@/components/topControls/components/keyboard/services/keyboardService.js';

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Attaches click handlers to the side buttons next to the keyboard.
 */
export function attachKeyboardSideButtonListeners(container: HTMLElement): ListenerAttachment {
  const canvas = container.querySelector<HTMLCanvasElement>('#piano');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) throw new Error('Keyboard canvas not available');

  const upBtn = container.querySelector('#octave-up') as HTMLButtonElement | null;
  const downBtn = container.querySelector('#octave-down') as HTMLButtonElement | null;
  const toggleBtn = container.querySelector('#disable-keyboard-inputs') as HTMLButtonElement | null;
  const instrumentBtn = container.querySelector('#global-instrument-select-btn') as HTMLButtonElement | null;

  function refreshKeyboard(): void {
    if (!ctx) return;
    const currentOct = getCurrentOctave();
    const keyMap = getKeyMap(currentOct);
    setKeyMapRef(keyMap);
    if (toggleBtn) {
      setSideButtonActivated(toggleBtn, isKeyboardInputEnabled());
    }
    const noteMap = isKeyboardInputEnabled() ? buildKeyToNoteMap(keyMap) : null;
    drawKeys(ctx, keyMap, new Set(), noteMap ?? undefined);
  }

  const handleOctaveUp = () => {
    const current = getCurrentOctave();
    if (current < 7) {
      setCurrentOctave(current + 1);
      refreshKeyboard();
    }
  };

  const handleOctaveDown = () => {
    const current = getCurrentOctave();
    if (current > 1) {
      setCurrentOctave(current - 1);
      refreshKeyboard();
    }
  };

  const handleToggleInput = () => {
    const enabled = isKeyboardInputEnabled();
    setKeyboardInputEnabled(!enabled);
    refreshKeyboard();
    if (toggleBtn) setSideButtonActivated(toggleBtn, !enabled);
  };

  const handleInstrument = async () => {
    const fullName = getKeyboardInstrument() || 'sf2/fluidr3-gm/acoustic_grand_piano';

    const instrumentSelectModal = document.getElementById('instrument-select-modal') as HTMLElement | null;
    if (!instrumentSelectModal) {
      console.warn('[Keyboard] Instrument selector modal not found in DOM.');
      return;
    }

    delete instrumentSelectModal.dataset.currentSequencer;
    await refreshInstrumentSelectorModal(fullName);
    instrumentSelectModal.classList.remove('hidden');
  };

  upBtn?.addEventListener('click', handleOctaveUp);
  downBtn?.addEventListener('click', handleOctaveDown);
  toggleBtn?.addEventListener('click', handleToggleInput);
  instrumentBtn?.addEventListener('click', handleInstrument);

  return {
    detach: () => {
      upBtn?.removeEventListener('click', handleOctaveUp);
      downBtn?.removeEventListener('click', handleOctaveDown);
      toggleBtn?.removeEventListener('click', handleToggleInput);
      instrumentBtn?.removeEventListener('click', handleInstrument);
    },
    refreshUI: refreshKeyboard
  };
}
