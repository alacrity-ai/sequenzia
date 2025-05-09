import { h } from '../domUtils.js';
import { createButton } from '../primitives/createButton.js';
import { createPopover } from '../primitives/createPopover.js';
import { createToggleSwitch } from '../primitives/createToggleSwitch.js';
import { createHorizontalDivider } from '../primitives/createHorizontalDivider.js';
import { getSongKey, setSongKey } from '@/shared/stores/songInfoStore.js';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';

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

export function createKeySelectorPopover(): {
  trigger: HTMLElement;
  mount: () => void;
} {
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
    setSongKey(key);
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

  let popoverInstance: ReturnType<typeof createPopover>['instance'] | null = null;

  const mount = () => {
    if (popoverInstance) return; // Prevent double mounting
    const { instance } = createPopover(triggerButton, contentBody, {
      title: 'Key Selector',
      placement: 'bottom',
      triggerType: 'click'
    });
    popoverInstance = instance;
    console.debug('[KeyPopover] Popover instance created:', popoverInstance);
  };

  function updateHighlight(): void {
    const allButtons = [...naturalRow.children, ...sharpRow.children];
    allButtons.forEach(btn => {
      if (!(btn instanceof HTMLButtonElement)) return;
      const btnKey = btn.textContent || '';
      btn.className = keyButtonClass(btnKey as KeyName, selectedPitch);
    });
    toggleInput.checked = selectedMode === 'm';
  }

  return { trigger: triggerButton, mount };
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


