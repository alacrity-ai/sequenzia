// src/globalControls/ui/sections/GlobalToolbar.ts

import { h } from '@/shared/ui/domUtils.js';
import { getAssetPath } from '@/global/assetHelpers.js';

function icon(name: string, alt: string): HTMLElement {
  return h('img', {
    src: getAssetPath(`static/svg/${name}.svg`),
    class: 'w-6 h-6',
    alt
  });
}

export function createGlobalToolbar(): HTMLElement {
  // === Mode Buttons ===
  const modeButtons = h('div', {
    class: 'flex gap-2 border-r border-purple-800 pr-3 mr-1'
  },
    h('button', {
      id: 'note-mode-btn',
      class: 'bg-blue-600 px-4 py-1 rounded-lg text-white hover:bg-blue-700 border-2 border-blue-400 cursor-pointer',
      title: 'Note Edit Mode'
    }, icon('icon-pen', 'Note Mode')),

    h('button', {
      id: 'ai-mode-btn',
      class: 'bg-gray-800 px-4 py-1 rounded-lg text-white hover:bg-purple-700 border-2 border-purple-400 cursor-pointer',
      title: 'AI Mode'
    }, icon('icon-brain', 'AI Mode'))
  );

  // === Note Edit Mode Controls ===
  const editModeControls = h('div', {
    class: 'flex gap-2 border-r border-purple-800 pr-3 mr-1'
  },
    h('button', {
      id: 'note-placement-options-btn',
      class: 'cursor-pointer bg-gray-800 px-4 py-1 rounded text-white hover:bg-purple-700 h-[42px] w-[52px] flex items-center justify-center',
      title: 'Note Placement (Q)'
    }, icon('icon-music', 'Placement')),

    h('button', {
      id: 'note-editing-options-btn',
      class: 'cursor-pointer bg-gray-800 px-4 py-1 rounded text-white hover:bg-purple-700 h-[42px] w-[52px] flex items-center justify-center',
      title: 'Note Editing (W)'
    }, icon('icon-ruler', 'Editing'))
  );

  // === Note Duration Buttons ===
  const durations = [
    ['4', '𝅝', 'Whole-Note (1)'],
    ['2', '𝅗𝅥', 'Half-Note (2)'],
    ['1', '𝅘𝅥', 'Quarter-Note (3)'],
    ['0.5', '♪', 'Eigth-Note (4)'],
    ['0.25', '♬', 'Sixteenth-Note (5)'],
    ['0.125', '𝅘𝅥𝅰', '32nd-Note (6)'],
  ].map(([value, symbol, title]) =>
    h('button', {
      class: 'note-duration-btn bg-gray-800 cursor-pointer px-4 py-1 rounded text-2xl text-white hover:bg-purple-700 h-[42px] w-[52px] flex items-center justify-center',
      'data-value': value,
      title
    }, symbol)
  );

  const dottedTriplet = [
    ['dotted-note-btn', '•', 'Toggle Dotted Note (.)'],
    ['triplet-note-btn', '³', 'Toggle Triplet (/)']
  ].map(([id, symbol, title]) =>
    h('button', {
      id,
      class: 'bg-gray-800 px-4 py-1 cursor-pointer rounded text-2xl text-white hover:bg-purple-700 h-[42px] w-[52px] flex items-center justify-center',
      title
    }, symbol)
  );

  const noteDurationControls = h('div', {
    id: 'note-duration-controls',
    class: 'flex gap-2'
  },
    ...durations,
    h('div', { class: 'border-l border-purple-800 mx-2' }),
    ...dottedTriplet
  );

  const noteDurationPanel = h('div', {
    id: 'note-duration-panel',
    class: 'flex gap-3'
  },
    editModeControls,
    noteDurationControls
  );

  // === Note Editing Controls (hidden by default) ===
  const noteEditingControls = h('div', {
    id: 'note-editing-controls',
    class: 'flex gap-2 hidden'
  },
    h('button', {
      id: 'velocity-mode-menu-btn',
      class: 'note-editing-velocity cursor-pointer bg-gray-800 px-4 py-1 rounded text-white hover:bg-purple-700 w-[52px] flex items-center justify-center',
      title: 'Adjust Velocity (V)'
    }, icon('icon-chart-bar', 'Velocity')),

    h('button', {
      id: 'quantize-mode-menu-btn',
      class: 'note-editing-quantize cursor-pointer bg-gray-800 px-4 py-1 rounded text-white hover:bg-purple-700 w-[52px] flex items-center justify-center',
      title: 'Quantize Notes (C)'
    }, icon('icon-clock', 'Quantize')),

    h('div', { class: 'border-l border-purple-800 mx-2' }),

    ...[
      ['note-editing-copy', 'icon-copy', 'Copy (CTRL+C)'],
      ['note-editing-cut', 'icon-cut', 'Cut (CTRL+X)'],
      ['note-editing-paste', 'icon-paste', 'Paste (CTRL+V)'],
      ['note-editing-delete', 'icon-trash', 'Delete (Del)']
    ].map(([cls, iconName, title]) =>
      h('button', {
        class: `${cls} bg-gray-800 px-4 py-1 cursor-pointer rounded text-white hover:bg-purple-700 w-[52px] flex items-center justify-center`,
        title
      }, icon(iconName, title))
    )
  );

  // === Velocity Mode Controls (hidden) ===
  const velocityModeControls = h('div', {
    id: 'velocity-mode-controls',
    class: 'flex gap-2 hidden'
  },
    h('button', {
      class: 'bg-gray-800 px-4 py-1 cursor-pointer rounded text-white hover:bg-purple-700 w-[52px] flex items-center justify-center',
      title: 'Velocity Tool (Coming Soon)'
    }, icon('icon-ruler', 'Velocity Tool'))
  );

  // === AI Control Panel ===
  const aiControlPanel = h('div', {
    id: 'ai-control-panel',
    class: 'flex gap-3 hidden'
  },
    ...[
      ['ai-inpaint-btn', 'icon-paintbrush', 'AI Inpaint'],
      ['ai-extend-btn', 'icon-forward', 'AI Extend'],
      ['ai-generate-btn', 'icon-lightbulb', 'AI Generate']
    ].map(([id, iconName, title]) =>
      h('button', {
        id,
        class: 'bg-gray-800 px-4 py-1 cursor-pointer rounded text-white hover:bg-purple-700 h-[42px] w-[52px] flex items-center justify-center',
        title
      }, icon(iconName, title))
    )
  );

  return h('div', {},
    modeButtons,
    noteDurationPanel,
    noteEditingControls,
    velocityModeControls,
    aiControlPanel
  );
}
