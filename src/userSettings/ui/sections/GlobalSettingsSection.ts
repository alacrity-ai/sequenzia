// src/userSettings/ui/sections/GlobalSettingsSection.ts
import { h } from '../../../shared/ui/domUtils.js';
import { createTooltipPair } from '../../../shared/ui/primitives/createTooltipPair.js';
import { createToggleSwitch } from '../../../shared/ui/primitives/createToggleSwitch.js';

export function createGlobalSettingsSection(): HTMLElement {
    const { trigger: tooltipTrigger, tooltip } = createTooltipPair(
      'tooltip-note-mode',
      '?',
      [
        h('p', {},
          h('span', { class: 'font-semibold text-purple-300', textContent: 'Default Mode:' }),
          ' gesture-based note placement. Allows click-and-drag selection and edit gestures.'
        ),
        h('p', {},
          h('span', { class: 'font-semibold text-purple-300', textContent: 'Express Mode:' }),
          ' notes are placed immediately on mouse down. Holding allows drag-resizing. Right-click initiates multi-note selection.'
        )
      ]
    );
  
    const toggle = createToggleSwitch({
      id: 'note-tool-toggle',
      label: 'Note Placement:',
      stateA: 'Default',
      stateB: 'Express',
      tooltipTrigger
    });
  
    return h('div', {},
      h('h2', {
        class: 'text-lg font-semibold mb-4',
        textContent: 'Global Settings'
      }),
      toggle,
      tooltip
    );
  }
