// src/userSettings/ui/sections/ThemeSettingsSection.ts

import { h } from '../../../shared/ui/domUtils.js';
import { GRID_COLOR_SCHEMES, NOTE_COLOR_SCHEMES } from '../../settings/themeConstants.js';

export function createThemeSettingsSection(): HTMLElement {
  const gridOptions = GRID_COLOR_SCHEMES.map(scheme =>
    h('option', { value: scheme, textContent: scheme })
  );

  const noteOptions = NOTE_COLOR_SCHEMES.map(scheme =>
    h('option', { value: scheme, textContent: scheme })
  );

  return h('div', {},
    h('h2', {
      className: 'text-lg font-semibold mb-4',
      textContent: 'Theme Settings'
    }),

    // Grid Color Scheme
    h('div', { className: 'mb-6' },
      h('label', {
        className: 'block text-sm font-medium mb-2',
        textContent: 'Grid Color Scheme'
      }),
      h('select', {
        id: 'grid-color-select',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer'
      }, ...gridOptions)
    ),

    // Note Color Scheme
    h('div', { className: 'mb-6' },
      h('label', {
        className: 'block text-sm font-medium mb-2',
        textContent: 'Note Color Scheme'
      }),
      h('select', {
        id: 'note-color-select',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer'
      }, ...noteOptions)
    )
  );
}
