// src/components/globalControls/ui/prefabs/gridSettingsPopover.ts

import { h } from '@/shared/ui/domUtils.js';
import { createPopover } from '@/shared/ui/primitives/createPopover.js';
import { createToggleSwitch, ToggleSwitchController } from '@/shared/ui/primitives/createToggleSwitch.js';
import { createAccentSpan } from '@/shared/ui/primitives/createAccentSpan';
import { createParagraph } from '@/shared/ui/primitives/createParagraph.js';
import { createTooltipPair } from '@/shared/ui/primitives/createTooltipPair.js';
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

export interface GridSettingsPopoverController {
  trigger: HTMLElement;
  refreshToggles: () => void;
}

/**
 * Creates the grid settings popover trigger and toggle UI.
 */
export function createGridSettingsPopover(): GridSettingsPopoverController {
  const skin = getCurrentSkin();

  const triggerButton = h('button', {
    id: 'note-placement-options-btn',
    class: 'bg-gray-800 px-3 py-1 rounded text-white hover:bg-purple-700 w-[52px] h-[42px] flex items-center justify-center',
    title: 'Grid Settings',
    style: 'cursor: pointer;'
  }, icon('icon-music', 'Placement'));

  // === Tooltip 1: Grid Key Guides
  const gridGuidesTooltip = createTooltipPair(
    'tooltip-grid-guides',
    '?',
    [
      createParagraph(
        createAccentSpan('Key Grid Highlighting:'),
        ' colors each piano roll row based on the current song key.'
      ),
      createParagraph(
        'In-key notes are shown as white rows. Out-of-key notes are shown as black rows.'
      )
    ]
  );

  const gridGuidesToggle: ToggleSwitchController = createToggleSwitch({
    id: 'toggle-grid-guides',
    stateA: 'Off',
    stateB: 'Transpose Grid to Key',
    inline: true,
    tooltipTrigger: gridGuidesTooltip.trigger
  });
  gridGuidesToggle.input.addEventListener('change', () => {
    setKeyGridHighlightingEnabled(gridGuidesToggle.getChecked());
  });

  // === Tooltip 2: Snap to Key
  const snapToKeyTooltip = createTooltipPair(
    'tooltip-snap-to-key',
    '?',
    [
      createParagraph(
        createAccentSpan('Snap to Key:'),
        ' constrains vertical note placement to notes in the current key.'
      ),
      createParagraph(
        'Hold ',
        createAccentSpan('CTRL'),
        ' while placing notes to temporarily allow chromatic input.'
      )
    ]
  );

  const snapToKeyToggle: ToggleSwitchController = createToggleSwitch({
    id: 'toggle-snap-key',
    stateA: 'Off',
    stateB: 'Snap Notes to Key',
    inline: true,
    tooltipTrigger: snapToKeyTooltip.trigger
  });
  snapToKeyToggle.input.addEventListener('change', () => {
    setSnapToInKeyEnabled(snapToKeyToggle.getChecked());
  });

  // === Tooltip 3: Snap to Grid
  const snapToGridTooltip = createTooltipPair(
    'tooltip-snap-to-grid',
    '?',
    [
      createParagraph(
        createAccentSpan('Snap to Grid:'),
        ' constrains horizontal note placement to musical durations.'
      ),
      createParagraph(
        'Notes will align to the selected beat value (e.g. quarter, eighth, sixteenth).'
      )
    ]
  );

  const snapToGridToggle: ToggleSwitchController = createToggleSwitch({
    id: 'toggle-snap-grid',
    stateA: 'Off',
    stateB: 'Snap Notes to Grid',
    inline: true,
    tooltipTrigger: snapToGridTooltip.trigger
  });
  snapToGridToggle.input.addEventListener('change', () => {
    setSnapToGridEnabled(snapToGridToggle.getChecked());
  });

  // === Refresh logic
  const refreshToggles = () => {
    gridGuidesToggle.setChecked(isKeyGridHighlightingEnabled());
    snapToKeyToggle.setChecked(isSnapToInKeyEnabled());
    snapToGridToggle.setChecked(isSnapToGridEnabled());
  };

  // === Content Body
  const contentBody = [
    h('div', { class: 'mb-1' }, gridGuidesToggle.element),
    gridGuidesTooltip.tooltip,

    h('div', { class: `my-2 border-t ${skin.borderColor} mb-3 mx-2` }),

    h('div', { class: 'mb-1' }, snapToKeyToggle.element),
    snapToKeyTooltip.tooltip,

    h('div', { class: 'mt-1' }, snapToGridToggle.element),
    snapToGridTooltip.tooltip
  ];

  createPopover(triggerButton, contentBody, {
    title: 'Grid Settings',
    placement: 'bottom',
    triggerType: 'click',
    onShow: () => requestAnimationFrame(refreshToggles)
  });

  return {
    trigger: triggerButton,
    refreshToggles
  };
}
