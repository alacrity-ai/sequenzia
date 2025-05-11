// src/globalControls/listeners/GlobalToolbarListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

import { SEQUENCER_CONFIG as config } from '@/components/sequencer/constants/sequencerConstants.js';
import { sequencers } from '@/components/sequencer/factories/SequencerFactory.js';
import { isKeyboardInputEnabled } from '@/components/topControls/components/keyboard/services/keyboardService.js';

import {
  updateSnapResolution,
  getSnapResolution,
  updateNoteDuration,
  getNoteDuration,
  updateNoteModifierMode,
  getIsTripletMode,
  getIsDottedMode
} from '@/shared/playback/transportService.js';
import { onStateUpdated } from '@/appState/onStateUpdated.js';

const durationHotkeys: Record<string, number> = {
  Digit1: 4,
  Digit2: 2,
  Digit3: 1,
  Digit4: 0.5,
  Digit5: 0.25,
  Digit6: 0.125
};

export function attachToolbarListeners(
  container: HTMLElement,
): ListenerAttachment {
  const durationButtons = container.querySelectorAll<HTMLButtonElement>('button[data-value]');
  const dottedNoteBtn = container.querySelector<HTMLButtonElement>('#dotted-note-btn');
  const tripletNoteBtn = container.querySelector<HTMLButtonElement>('#triplet-note-btn');

  const highlightActiveDuration = () => {
    const snap = getSnapResolution();
    const duration = getNoteDuration();

    durationButtons.forEach(btn => {
      const val = parseFloat(btn.dataset.value ?? '-1');

      btn.classList.remove('bg-purple-700', 'bg-blue-700', 'bg-gray-800');
      btn.classList.add('bg-transparent');

      const isDuration = val === duration;
      const isSnap = val === snap;

      if (isDuration) {
        btn.classList.add('bg-purple-700');
        btn.classList.remove('bg-transparent');
      } else if (isSnap) {
        btn.classList.add('bg-blue-700');
        btn.classList.remove('bg-transparent');
      } else {
        btn.classList.add('bg-gray-800');
      }
    });
  };

  const unsubscribe = onStateUpdated((state) => {
    highlightActiveDuration();

    dottedNoteBtn?.classList.toggle('bg-purple-700', state.isDottedMode);
    dottedNoteBtn?.classList.toggle('bg-transparent', !state.isDottedMode);

    tripletNoteBtn?.classList.toggle('bg-purple-700', state.isTripletMode);
    tripletNoteBtn?.classList.toggle('bg-transparent', !state.isTripletMode);

    applyNoteDuration(state.noteDuration, false);
  });

  const applyNoteDuration = (baseValue: number, record = true): void => {
    const isDotted = getIsDottedMode();
    const isTriplet = getIsTripletMode();

    let adjusted = baseValue;
    if (isDotted) adjusted *= 1.5;
    else if (isTriplet) adjusted *= 2 / 3;

    config.currentDuration = adjusted;

    sequencers.forEach(seq => {
      seq.config.currentDuration = adjusted;
      seq.matrix?.requestRedraw();
    });

    updateNoteDuration(baseValue, record);
  };

  const updateCurrentDuration = (record = true) => {
    const activeBtn = container.querySelector<HTMLButtonElement>('button[data-value].bg-purple-700');
    if (activeBtn) {
      const baseValue = parseFloat(activeBtn.dataset.value!);
      applyNoteDuration(baseValue, record);
    }
  };

  const refreshUI = () => {
    highlightActiveDuration();
    const isDotted = getIsDottedMode();
    const isTriplet = getIsTripletMode();

    dottedNoteBtn?.classList.toggle('bg-purple-700', isDotted);
    dottedNoteBtn?.classList.toggle('bg-transparent', !isDotted);

    tripletNoteBtn?.classList.toggle('bg-purple-700', isTriplet);
    tripletNoteBtn?.classList.toggle('bg-transparent', !isTriplet);
  };

  // === Duration Buttons (left: duration, right: snap)
  durationButtons.forEach(btn => {
    btn.classList.add('note-duration-btn');

    btn.addEventListener('click', (e: MouseEvent) => {
      if (e.button === 0) {
        const base = parseFloat(btn.dataset.value!);
        applyNoteDuration(base);
      }
    });

    btn.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      const base = parseFloat(btn.dataset.value!);
      updateSnapResolution(base, true);
    });
  });

// === Triplet Toggle
tripletNoteBtn?.addEventListener('click', () => {
  const nowTriplet = !getIsTripletMode();
  updateNoteModifierMode(nowTriplet, false); // mutually exclusive
  updateCurrentDuration(false);
});

// === Dotted Toggle
dottedNoteBtn?.addEventListener('click', () => {
  const nowDotted = !getIsDottedMode();
  updateNoteModifierMode(false, nowDotted); // mutually exclusive
  updateCurrentDuration(false);
});


  // === Hotkeys
  const handleKeydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      isKeyboardInputEnabled()
    ) return;

    if (durationHotkeys.hasOwnProperty(e.code)) {
      e.preventDefault();
      const baseValue = durationHotkeys[e.code];

      if (e.shiftKey) {
        updateSnapResolution(baseValue, true);
      } else {
        applyNoteDuration(baseValue);
      }

      return;
    }

    if (e.key === '.') {
      e.preventDefault();
      dottedNoteBtn?.click();
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      tripletNoteBtn?.click();
      return;
    }
  };

  window.addEventListener('keydown', handleKeydown);
  refreshUI();

  return {
    detach: () => {
      window.removeEventListener('keydown', handleKeydown);
      unsubscribe();

      durationButtons.forEach(btn => {
        const clone = btn.cloneNode(true);
        btn.replaceWith(clone);
      });

      const dottedClone = dottedNoteBtn?.cloneNode(true);
      if (dottedClone && dottedNoteBtn?.parentNode) {
        dottedNoteBtn.parentNode.replaceChild(dottedClone, dottedNoteBtn);
      }

      const tripletClone = tripletNoteBtn?.cloneNode(true);
      if (tripletClone && tripletNoteBtn?.parentNode) {
        tripletNoteBtn.parentNode.replaceChild(tripletClone, tripletNoteBtn);
      }
    },
    refreshUI
  };
}
