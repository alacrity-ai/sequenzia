// src/globalControls/listeners/GlobalToolbarListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

import { isButtonDisabled } from '@/components/globalControls/controls/autoCompleteButtonControls.js';
import { SEQUENCER_CONFIG as config } from '@/components/sequencer/constants/sequencerConstants.js';
import { handleRunAIAutocomplete } from '@/components/aimode/autocomplete/helpers/runAIAutoComplete.js';
import { applyAutoCompleteNotes } from '@/components/aimode/autocomplete/helpers/applyAutoCompleteNotes.js';
import { getSequencers } from '@/components/sequencer/stores/sequencerStore.js';
import { getLastActiveSequencerId } from '@/components/sequencer/stores/sequencerStore.js';
import { isKeyboardInputEnabled } from '@/components/topControls/components/keyboard/services/keyboardService.js';
import {
  toggleIsAutocompleteEnabled,
  subscribeAutocompleteState
} from '@/components/aimode/autocomplete/stores/autoCompleteStore.js';

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

interface ToolbarListenerOptions {
  rootElement: HTMLElement;
  noteOptionsGroup: HTMLElement;
  aiOptionsGroup: HTMLElement;
}

export function attachToolbarListeners(
  options: ToolbarListenerOptions
): ListenerAttachment {
  const { rootElement, noteOptionsGroup, aiOptionsGroup } = options;

  // Get the DOM elements
  const durationButtons = rootElement.querySelectorAll<HTMLButtonElement>('button[data-value]');
  const dottedNoteBtn = rootElement.querySelector<HTMLButtonElement>('#dotted-note-btn');
  const tripletNoteBtn = rootElement.querySelector<HTMLButtonElement>('#triplet-note-btn');
  const noteModeBtn = rootElement.querySelector<HTMLButtonElement>('#note-mode-btn');
  const aiModeBtn = rootElement.querySelector<HTMLButtonElement>('#ai-mode-btn');
  const autocompleteToggleBtn = rootElement.querySelector<HTMLButtonElement>('#autocomplete-toggle-btn');

  const autocompleteApproveBtn = rootElement.querySelector<HTMLButtonElement>('#autocomplete-approve-btn');
  const autocompleteRejectBtn = rootElement.querySelector<HTMLButtonElement>('#autocomplete-reject-btn');

  const aiToolsBtn = rootElement.querySelector<HTMLButtonElement>('#ai-tools-btn');
  const aiExtendBeforeBtn = rootElement.querySelector<HTMLButtonElement>('#ai-extend-before-btn');
  const aiPaintBtn = rootElement.querySelector<HTMLButtonElement>('#ai-paint-btn');
  const aiExtendAfterBtn = rootElement.querySelector<HTMLButtonElement>('#ai-extend-after-btn');
  const aiAdjustPromptBtn = rootElement.querySelector<HTMLButtonElement>('#ai-adjust-prompt-btn');
  const aiDebuggerBtn = rootElement.querySelector<HTMLButtonElement>('#ai-debugger-btn');

  // === Mode Toggle Logic ===
  const setMode = (mode: 'note' | 'ai') => {
    const isNoteMode = mode === 'note';

    noteOptionsGroup.classList.toggle('hidden', !isNoteMode);
    aiOptionsGroup.classList.toggle('hidden', isNoteMode);

    noteModeBtn?.classList.toggle('bg-blue-600', isNoteMode);
    noteModeBtn?.classList.toggle('bg-gray-800', !isNoteMode);

    aiModeBtn?.classList.toggle('bg-purple-700', !isNoteMode);
    aiModeBtn?.classList.toggle('bg-gray-800', isNoteMode);
  };

  noteModeBtn?.addEventListener('click', () => setMode('note'));
  aiModeBtn?.addEventListener('click', () => setMode('ai'));

  // === AI Mode Buttons:

  // === Autocomplete Controls ===

  autocompleteToggleBtn?.addEventListener('click', (e: MouseEvent) => {
    // Left click only
    if (e.button !== 0) return;
    handleRunAIAutocomplete('GlobalToolbarListeners');
  });

  // Right click → toggle mode
  autocompleteToggleBtn?.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault(); // Prevent context menu from showing
    toggleIsAutocompleteEnabled();
    console.log('Toggled Autocomplete Mode');
  });

  autocompleteApproveBtn?.addEventListener('click', () => {
    console.log('Approved Autocompleted Notes');
    const lastActiveSequencerId = getLastActiveSequencerId();
    if (lastActiveSequencerId === null) {
      console.warn('No active sequencer to apply autocomplete to.');
      return;
    }

    applyAutoCompleteNotes(lastActiveSequencerId);
  });

  // === AI Tools Button ===
  aiToolsBtn?.addEventListener('click', () => {
    console.log('AI Tools Popover Triggered (placeholder)');
  });

  // === Extend / Paint Buttons ===
  aiExtendBeforeBtn?.addEventListener('click', () => {
    console.log('AI Extend Before Triggered (placeholder)');
  });

  aiPaintBtn?.addEventListener('click', () => {
    console.log('AI Paint Tool Activated (placeholder)');
  });

  aiExtendAfterBtn?.addEventListener('click', () => {
    console.log('AI Extend After Triggered (placeholder)');
  });

  // === Advanced Settings Buttons ===
  aiAdjustPromptBtn?.addEventListener('click', () => {
    console.log('AI Prompt Settings Modal Opened (placeholder)');
  });

  aiDebuggerBtn?.addEventListener('click', () => {
    console.log('AI Debugger Panel Opened (placeholder)');
  });

  // Note Mode Duration Buttons
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

  const unsubscribeAutocomplete = subscribeAutocompleteState((enabled) => {
    autocompleteToggleBtn?.classList.toggle('bg-pink-400', enabled);
    autocompleteToggleBtn?.classList.toggle('bg-transparent', !enabled);
  });


  const applyNoteDuration = (baseValue: number, record = true): void => {
    const isDotted = getIsDottedMode();
    const isTriplet = getIsTripletMode();

    let adjusted = baseValue;
    if (isDotted) adjusted *= 1.5;
    else if (isTriplet) adjusted *= 2 / 3;

    config.currentDuration = adjusted;
    const sequencers = getSequencers();

    sequencers.forEach(seq => {
      seq.config.currentDuration = adjusted;
      seq.matrix?.requestRedraw();
    });

    updateNoteDuration(baseValue, record);
  };

  const updateCurrentDuration = (record = true) => {
    const activeBtn = rootElement.querySelector<HTMLButtonElement>('button[data-value].bg-purple-700');
    if (activeBtn) {
      const baseValue = parseFloat(activeBtn.dataset.value!);
      applyNoteDuration(baseValue, record);
    }
  };

  const refreshUI = () => {
    highlightActiveDuration();
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

  // === Keyboard Shortcuts ===
  const handleKeydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      isKeyboardInputEnabled()
    ) return;

    // === Note Duration Hotkeys
    if (!noteOptionsGroup.classList.contains('hidden')) {
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
    }

    // === AI Autocomplete Hotkeys 
    switch (e.code) {
      case 'KeyG':
        e.preventDefault();

        if (e.shiftKey) {
          toggleIsAutocompleteEnabled();
          console.log('Toggled Autocomplete Mode via Shift+G');
        } else {
          // Don't run autocomplete if already running
          if (!isButtonDisabled()) {
            handleRunAIAutocomplete('GlobalToolbarListeners');
          }
        }
        return;

      case 'Tab':
        e.preventDefault();
        autocompleteApproveBtn?.click();
        return;

      // Toolbar Menu Switching
      case 'KeyQ':
        e.preventDefault();
        noteModeBtn?.click();
        return;

      case 'KeyW':
        e.preventDefault();
        aiModeBtn?.click();
        return;
    }
  };

  window.addEventListener('keydown', handleKeydown);

  refreshUI();

  // --- Detach & Refresh Functions ---
  const detach = () => {
    window.removeEventListener('keydown', handleKeydown);
    unsubscribe();
    unsubscribeAutocomplete();

    // Buttons needing listener cleanup
    const aiButtons = [
      noteModeBtn,
      aiModeBtn,
      autocompleteToggleBtn,
      autocompleteApproveBtn,
      autocompleteRejectBtn,
      aiToolsBtn,
      aiExtendBeforeBtn,
      aiPaintBtn,
      aiExtendAfterBtn,
      aiAdjustPromptBtn,
      aiDebuggerBtn
    ];

    aiButtons.forEach(btn => {
      if (btn) btn.replaceWith(btn.cloneNode(true));
    });

    // Duration buttons cleanup
    durationButtons.forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.replaceWith(clone);
    });

    // Dotted & Triplet buttons cleanup
    const dottedClone = dottedNoteBtn?.cloneNode(true);
    if (dottedClone && dottedNoteBtn?.parentNode) {
      dottedNoteBtn.parentNode.replaceChild(dottedClone, dottedNoteBtn);
    }

    const tripletClone = tripletNoteBtn?.cloneNode(true);
    if (tripletClone && tripletNoteBtn?.parentNode) {
      tripletNoteBtn.parentNode.replaceChild(tripletClone, tripletNoteBtn);
    }
  };

  return {
    detach,
    refreshUI
  };
}
