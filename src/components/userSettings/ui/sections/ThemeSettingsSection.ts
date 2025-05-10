// src/components/userSettings/ui/sections/ThemeSettingsSection.ts

import { h } from '@/shared/ui/domUtils.js';
import { GRID_COLOR_SCHEMES, NOTE_COLOR_SCHEMES, SKINS } from '@/components/userSettings/settings/themeConstants.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { createLabel } from '@/shared/ui/primitives/createLabel.js';


export function createThemeSettingsSection(): HTMLElement {
  const gridOptions = GRID_COLOR_SCHEMES.map(s =>
    h('option', { value: s, textContent: s })
  );

  const noteOptions = NOTE_COLOR_SCHEMES.map(s =>
    h('option', { value: s, textContent: s })
  );

  const skinOptions = SKINS.map(s =>
    h('option', { value: s, textContent: s })
  );

  return h('div', {},
    createHeader('Theme Settings'),

    // Skin selection
    h('div', { className: 'mb-6' },
      createLabel('Interface Skin'),
      h('select', {
        id: 'skin-select',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer'
      }, ...skinOptions)
    ),

    // Grid Color Scheme
    h('div', { className: 'mb-6' },
      createLabel('Grid Color Scheme'),
      h('select', {
        id: 'grid-color-select',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer'
      }, ...gridOptions)
    ),

    // Note Color Scheme
    h('div', { className: 'mb-6' },
      createLabel('Note Color Scheme'),
      h('select', {
        id: 'note-color-select',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer'
      }, ...noteOptions)
    )
  );
}
