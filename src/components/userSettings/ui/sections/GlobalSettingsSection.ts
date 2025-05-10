// src/components/userSettings/ui/sections/GlobalSettingsSection.ts

import { h } from '@/shared/ui/domUtils.js';
import { createTooltipPair } from '@/shared/ui/primitives/createTooltipPair.js';
import { createToggleSwitch } from '@/shared/ui/primitives/createToggleSwitch.js';
import { createParagraph } from '@/shared/ui/primitives/createParagraph.js';
import { createAccentSpan } from '@/shared/ui/primitives/createAccentSpan.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';

export function createGlobalSettingsSection(): HTMLElement {
  const { trigger: tooltipTrigger, tooltip } = createTooltipPair(
    'tooltip-note-mode',
    '?',
    [
      createParagraph(
        createAccentSpan('Default Mode:'),
        ' gesture-based note placement. Allows click-and-drag selection and edit gestures.'
      ),
      createParagraph(
        createAccentSpan('Express Mode:'),
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
    createHeader('Global Settings'),
    toggle,
    tooltip
  );
}
