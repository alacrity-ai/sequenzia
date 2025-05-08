// src/globalControls/ui/sections/TransportControls.ts

import { h } from '@/shared/ui/domUtils.js';
import { getAssetPath } from '@/global/assetHelpers.js';

function icon(name: string, alt: string): HTMLElement {
  return h('img', {
    src: getAssetPath(`static/svg/${name}.svg`),
    class: 'w-6 h-6',
    alt
  });
}

export function createTransportControls(): HTMLElement {
  return h('div', {},
    // Play Button
    h('button', {
      id: 'play-button',
      title: 'Play/Pause',
      class: 'w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-full shadow text-white transition-all cursor-pointer hover:scale-110 select-none focus:outline-none focus:ring-0'
    }, icon('icon-play', 'Play')),

    // Stop Button
    h('button', {
      id: 'stop-button',
      title: 'Stop',
      class: 'w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-full shadow text-white transition-all cursor-pointer hover:scale-110 select-none focus:outline-none focus:ring-0'
    }, icon('icon-stop', 'Stop')),

    // Divider
    h('div', { class: 'h-12 w-px bg-purple-800' }),

    // Record Button
    h('button', {
      id: 'record-button',
      title: 'Record',
      class: 'w-12 h-12 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full shadow text-white cursor-pointer transition-all hover:scale-110 select-none focus:outline-none focus:ring-0'
    }, icon('icon-record', 'Record')),

    // Divider
    h('div', { class: 'h-12 w-px bg-purple-800' }),

    // Hidden note-duration selector (used for logic, not visible)
    h('select', {
      id: 'note-duration',
      class: 'hidden'
    },
      h('option', { value: '4' }, '𝅝'),
      h('option', { value: '2' }, '𝅗𝅥'),
      h('option', { value: '1' }, '𝅘𝅥'),
      h('option', { value: '0.5' }, '♪'),
      h('option', { value: '0.25' }, '♬'),
      h('option', { value: '0.125' }, '𝅘𝅥𝅰')
    ),

    // Snap resolution select
    h('div', { class: 'flex items-center gap-2' },
      h('span', { class: 'text-white' }, 'Snap:'),
      h('select', {
        id: 'snap-resolution',
        class: 'bg-gray-800 text-white border border-purple-700 px-2 py-1 rounded text-2xl'
      },
        h('option', { value: '4' }, '𝅝'),
        h('option', { value: '2' }, '𝅗𝅥'),
        h('option', { value: '1' }, '𝅘𝅥'),
        h('option', { value: '0.5' }, '♪'),
        h('option', { value: '0.25' }, '♬'),
        h('option', { value: '0.125' }, '𝅘𝅥𝅰')
      )
    ),

    // Loop Toggle
    h('label', { class: 'flex items-center gap-2' },
      h('input', {
        id: 'loop-toggle',
        type: 'checkbox',
        class: 'cursor-pointer accent-purple-500'
      }),
      h('span', {}, 'Loop')
    ),

    // Tempo
    h('label', { class: 'flex items-center gap-2' },
      h('span', {}, 'Tempo:'),
      h('input', {
        id: 'tempo-input',
        type: 'number',
        min: 20,
        max: 300,
        value: '120',
        class: 'w-16 bg-gray-800 text-white border border-purple-700 px-2 py-1 rounded'
      })
    ),

    // Measures
    h('div', { class: 'flex items-center gap-2' },
      h('span', {}, 'Measures:'),
      h('input', {
        id: 'measures-input',
        type: 'number',
        min: 1,
        max: 1000,
        value: '8',
        class: 'w-16 bg-gray-800 text-white border border-purple-700 px-2 py-1 rounded'
      })
    ),

    // Beats
    h('div', { class: 'flex items-center gap-2' },
      h('span', {}, 'Beats:'),
      h('input', {
        id: 'beats-per-measure-input',
        type: 'number',
        min: 1,
        max: 16,
        value: '4',
        class: 'w-16 bg-gray-800 text-white border border-purple-700 px-2 py-1 rounded'
      })
    ),

    // Save Button
    h('button', {
      id: 'save-button',
      title: 'Save',
      class: 'w-12 h-12 flex items-center justify-center cursor-pointer bg-green-600 hover:bg-green-700 rounded-full shadow text-white transition-all hover:scale-110'
    }, icon('icon-save', 'Save')),

    // Load Button + Hidden File Input
    h('button', {
      id: 'load-button',
      title: 'Load',
      class: 'w-12 h-12 flex items-center justify-center cursor-pointer bg-yellow-600 hover:bg-yellow-700 rounded-full shadow text-white transition-all hover:scale-110'
    }, icon('icon-load', 'Load')),

    h('input', {
      id: 'load-input',
      type: 'file',
      accept: '.json',
      style: 'display: none;'
    }),

    // Divider
    h('div', { class: 'h-12 w-px bg-purple-800' }),

    // Settings Button
    h('button', {
      id: 'config-button',
      title: 'User Settings',
      class: 'w-12 h-12 flex items-center justify-center cursor-pointer bg-purple-600 hover:bg-purple-700 rounded-full shadow text-white transition-all hover:scale-110'
    }, icon('icon-user-settings', 'Settings'))
  );
}
