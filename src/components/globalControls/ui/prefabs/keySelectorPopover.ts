// src/globalControls/ui/prefabs/keySelectorPopover.ts

import { h } from '@/shared/ui/domUtils.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createPopover } from '@/shared/ui/primitives/createPopover.js';
import { createToggleSwitch } from '@/shared/ui/primitives/createToggleSwitch.js';
import { createHorizontalDivider } from '@/shared/ui/primitives/createHorizontalDivider.js';
import { getSongKey, updateSongKey } from '@/shared/playback/transportService.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

import { onStateUpdated } from '@/appState/onStateUpdated.js';
import type { AppState } from '@/appState/interfaces/AppState.js';

import type { SongKey } from '@/shared/types/SongKey.ts';

const NATURAL_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const SHARP_KEYS = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''] as const;

type KeyName = typeof NATURAL_KEYS[number] | typeof SHARP_KEYS[number];
type Mode = 'M' | 'm';

function getCurrentKey(): string {
  return getSongKey() ?? 'CM';
}

function extractPitchMode(key: string): [KeyName, Mode] {
  const mode = key.endsWith('m') ? 'm' : 'M';
  const pitch = key.slice(0, key.length - 1) as KeyName;
  return [pitch, mode];
}

export function createKeySelectorPopover(): HTMLElement {
  const skin = getCurrentSkin();
  let [selectedPitch, selectedMode] = extractPitchMode(getCurrentKey());

  const triggerButton = createButton({
    id: 'key-selector-trigger',
    text: `${selectedPitch}${selectedMode}`,
    kind: 'secondary',
    additionalClasses: 'w-14 px-2 py-[10px] text-center truncate'
  });

  const updateKey = (pitch: KeyName, mode: Mode) => {
    if (pitch === '') return;
    selectedPitch = pitch;
    selectedMode = mode;
    const key = `${pitch}${mode}` as SongKey;
    updateSongKey(key);
    triggerButton.textContent = key;
    updateHighlight();
  };

  const naturalRow = h('div', {
    class: 'flex w-full mt-2 gap-[6px]'
  }, ...NATURAL_KEYS.map(pitch =>
    h('button', {
      class: keyButtonClass(pitch, selectedPitch),
      onClick: () => updateKey(pitch, selectedMode)
    }, pitch)
  ));

  const sharpRow = h('div', {
    class: 'flex w-full mb-1 gap-[6px] translate-x-[22px]'
  }, ...SHARP_KEYS.map(pitch => {
    if (pitch === '') {
      return h('div', { class: 'w-8' }); // spacer
    }
    return h('button', {
      class: keyButtonClass(pitch, selectedPitch),
      onClick: () => updateKey(pitch, selectedMode)
    }, pitch);
  }));

  const toggleSwitch = createToggleSwitch({
    id: 'key-mode-toggle',
    stateA: 'Major',
    stateB: 'Minor',
    inline: true
  });

  const toggleInput = toggleSwitch.querySelector('input[type="checkbox"]') as HTMLInputElement;
  toggleInput.checked = selectedMode === 'm';

  toggleInput.addEventListener('change', () => {
    const newMode: Mode = toggleInput.checked ? 'm' : 'M';
    updateKey(selectedPitch, newMode);
  });

  const contentBody = [sharpRow, naturalRow, createHorizontalDivider(), toggleSwitch];

  function updateHighlight(): void {
    const allButtons = [...naturalRow.children, ...sharpRow.children];
    allButtons.forEach(btn => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const btnKey = btn.textContent || '';
      btn.className = keyButtonClass(btnKey as KeyName, selectedPitch);
    });
    toggleInput.checked = selectedMode === 'm';
  }

  createPopover(triggerButton, contentBody, {
    title: 'Key Selector',
    placement: 'bottom',
    triggerType: 'click'
  });

  onStateUpdated((state: AppState) => {
    const [pitch, mode] = extractPitchMode(state.songKey);

    triggerButton.textContent = state.songKey;
    toggleInput.checked = mode === 'm';

    const allButtons = [...naturalRow.children, ...sharpRow.children];
    allButtons.forEach(btn => {
        if (!(btn instanceof HTMLButtonElement)) return;
        const btnKey = btn.textContent || '';
        btn.className = keyButtonClass(btnKey as KeyName, pitch);
    });
  });

  return triggerButton;
}

// === Styling helpers ===

function keyButtonClass(pitch: string, selected: string): string {
  const isSelected = pitch === selected;

  return [
    'w-8 h-8 rounded-full text-xs flex items-center justify-center',
    'transition-all duration-150',
    'cursor-pointer focus:outline-none',
    'text-white',
    isSelected
      ? 'bg-cyan-600 ring-2 ring-white'
      : 'bg-gray-600 hover:bg-gray-500 hover:ring-1 hover:ring-white'
  ].join(' ');
}


