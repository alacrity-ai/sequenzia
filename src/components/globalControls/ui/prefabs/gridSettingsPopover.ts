// src/globalControls/ui/prefabs/gridSettingsPopover.ts

import { h } from '@/shared/ui/domUtils.js';
import { createPopover } from '@/shared/ui/primitives/createPopover.js';
import { createToggleSwitch } from '@/shared/ui/primitives/createToggleSwitch.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

/**
 * Creates the grid settings popover trigger button and content.
 */
export function createGridSettingsPopover(): HTMLElement {
  const skin = getCurrentSkin();

  const triggerButton = h('button', {
    id: 'note-placement-options-btn',
    class: 'bg-gray-800 px-3 py-1 rounded text-white hover:bg-purple-700 w-[52px] h-[42px] flex items-center justify-center',
    style: 'cursor: pointer;'
  }, icon('icon-music', 'Placement'));

  // === Toggle 1: Grid Key Guides
  const gridGuidesToggle = createToggleSwitch({
    id: 'toggle-grid-guides',
    stateA: 'Off',
    stateB: 'Key Guides',
    inline: true
  });

  gridGuidesToggle.querySelector('input')?.addEventListener('change', (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    console.log(`Grid Key Guides ${isChecked ? 'enabled' : 'disabled'}`);
  });

  // === Toggle 2: Snap to Key Guides
  const snapToKeyToggle = createToggleSwitch({
    id: 'toggle-snap-key',
    stateA: 'Off',
    stateB: 'Snap to Keys',
    inline: true
  });

  snapToKeyToggle.querySelector('input')?.addEventListener('change', (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    console.log(`Snap to Key Guides ${isChecked ? 'enabled' : 'disabled'}`);
  });

  // === Toggle 3: Snap to Grid (after break)
  const snapToGridToggle = createToggleSwitch({
    id: 'toggle-snap-grid',
    stateA: 'Off',
    stateB: 'Snap to Grid',
    inline: true
  });

  snapToGridToggle.querySelector('input')?.addEventListener('change', (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    console.log(`Snap to Grid ${isChecked ? 'enabled' : 'disabled'}`);
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
    triggerType: 'click'
  });

  return triggerButton;
}
