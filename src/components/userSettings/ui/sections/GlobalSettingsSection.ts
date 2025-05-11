// src/components/userSettings/ui/sections/GlobalSettingsSection.ts

import { h } from '@/shared/ui/domUtils.js';
import { createTooltipPair } from '@/shared/ui/primitives/createTooltipPair.js';
import { createToggleSwitch, ToggleSwitchController } from '@/shared/ui/primitives/createToggleSwitch.js';
import { createParagraph } from '@/shared/ui/primitives/createParagraph.js';
import { createAccentSpan } from '@/shared/ui/primitives/createAccentSpan.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { getUserConfig, updateUserConfig } from '@/components/userSettings/store/userConfigStore.js';
import type { NoteToolFlavor } from '@/components/userSettings/interfaces/GlobalSettings.js';

export interface GlobalSettingsSectionController {
  element: HTMLElement;
  refreshToggle: () => void;
}

export function createGlobalSettingsSection(): GlobalSettingsSectionController {
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

  const toggle: ToggleSwitchController = createToggleSwitch({
    id: 'note-tool-toggle',
    label: 'Note Placement:',
    stateA: 'Default',
    stateB: 'Express',
    tooltipTrigger
  });

  toggle.input.addEventListener('change', () => {
    const newMode: NoteToolFlavor = toggle.getChecked() ? 'express' : 'default';
    updateUserConfig({ global: { noteToolMode: newMode } });
  });

  const refreshToggle = () => {
    const current = getUserConfig().global.noteToolMode;
    toggle.setChecked(current === 'express');
  };

  const section = h('div', {},
    createHeader('Global Settings'),
    toggle.element,
    tooltip
  );

  return {
    element: section,
    refreshToggle
  };
}
