// src/globalControls/ui/prefabs/gridSettingsPopover.ts

import { h } from '@/shared/ui/domUtils.js';
import { createPopover } from '@/shared/ui/primitives/createPopover.js';
import { createToggleSwitch } from '@/shared/ui/primitives/createToggleSwitch.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';
import {
  isKeyGridHighlightingEnabled,
  setKeyGridHighlightingEnabled,
  isSnapToInKeyEnabled,
  setSnapToInKeyEnabled,
  isSnapToGridEnabled,
  setSnapToGridEnabled
} from '@/shared/stores/songInfoStore.js';

/**
 * Creates the grid settings popover trigger button and content.
 */
export function createGridSettingsPopover(): HTMLElement {
  const skin = getCurrentSkin();

  const triggerButton = h('button', {
    id: 'note-placement-options-btn',
    class: 'bg-gray-800 px-3 py-1 rounded text-white hover:bg-purple-700 w-[52px] h-[42px] flex items-center justify-center',
    title: 'Grid Settings',
    style: 'cursor: pointer;'
  }, icon('icon-music', 'Placement'));

  // === Toggle 1: Grid Key Guides
  const gridGuidesToggle = createToggleSwitch({
    id: 'toggle-grid-guides',
    stateA: 'Off',
    stateB: 'Key Guides',
    inline: true
  });
  const gridGuidesInput = gridGuidesToggle.querySelector('input')!;
  gridGuidesInput.addEventListener('change', (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    setKeyGridHighlightingEnabled(isChecked);
  });

  // === Toggle 2: Snap to Key
  const snapToKeyToggle = createToggleSwitch({
    id: 'toggle-snap-key',
    stateA: 'Off',
    stateB: 'Snap to Keys',
    inline: true
  });
  const snapToKeyInput = snapToKeyToggle.querySelector('input')!;
  snapToKeyInput.addEventListener('change', (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    setSnapToInKeyEnabled(isChecked);
  });

  // === Toggle 3: Snap to Grid
  const snapToGridToggle = createToggleSwitch({
    id: 'toggle-snap-grid',
    stateA: 'Off',
    stateB: 'Snap to Grid',
    inline: true
  });
  const snapToGridInput = snapToGridToggle.querySelector('input')!;
  snapToGridInput.addEventListener('change', (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    setSnapToGridEnabled(isChecked);
  });

  // === Content Body
  const contentBody = [
    h('div', { class: 'mb-1' }, gridGuidesToggle),
    h('div', { class: 'mb-1' }, snapToKeyToggle),
    h('div', { class: `my-2 border-t ${skin.borderColor} mb-3 mx-2` }),
    h('div', { class: 'mt-1' }, snapToGridToggle)
  ];

  createPopover(triggerButton, contentBody, {
    title: 'Grid Settings',
    placement: 'bottom',
    triggerType: 'click',
    onShow: () => {
      requestAnimationFrame(() => {
        gridGuidesInput.checked = isKeyGridHighlightingEnabled();
        snapToKeyInput.checked = isSnapToInKeyEnabled();
        snapToGridInput.checked = isSnapToGridEnabled();
      });
    }

  });

  return triggerButton;
}
