// src/components/globalControls/ui/sections/GlobalToolbar.ts

import { setAutocompleteToggleButton } from '@/components/globalControls/controls/autoCompleteButtonControls.js';

import { h } from '@/shared/ui/domUtils.js';
import { createEditorSelectorPopover } from '@/components/globalControls/ui/prefabs/editorSelectorPopover.js';
import { createGridSettingsPopover } from '@/components/globalControls/ui/prefabs/gridSettingsPopover.js';
import { NOTE_RESOLUTION_OPTIONS } from '@/components/globalControls/constants.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';

export interface GlobalToolbarController {
  element: HTMLElement;
  refreshGridSettings: () => void;
  noteOptionsGroup: HTMLElement;
  aiOptionsGroup: HTMLElement;
}

export function createGlobalToolbar(): GlobalToolbarController {
  const gridSettings = createGridSettingsPopover();

  const toolbarEl = h('div', {
    class: 'flex flex-wrap justify-center items-center gap-4 p-4'
  },

    // Mode toggles
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md cursor-pointer'
    },
      h('button', {
        id: 'note-mode-btn',
        class: 'bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700 text-sm font-semibold w-[52px] h-[42px] flex items-center justify-center',
        style: 'cursor: pointer;',
        title: 'Drawing Toolbar (Q)'
      }, icon('icon-pen', 'Note Mode')),

      h('button', {
        id: 'ai-mode-btn',
        class: 'bg-gray-800 px-3 py-1 rounded text-white hover:bg-purple-700 text-sm font-semibold w-[52px] h-[42px] flex items-center justify-center',
        style: 'cursor: pointer;',
        title: 'AI Toolbar (W)'
      }, icon('icon-brain-white', 'AI Mode'))
    ),
  );

  // Note Options Group
  const noteOptionsGroup = h('div', { class: 'flex gap-4' },
    // Subsection 1: Placement/editing submenu toggles
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md cursor-pointer'
    },
      gridSettings.trigger,
      createEditorSelectorPopover()
    ),
    // Subsection 2: Note duration buttons
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md'
    },
      ...NOTE_RESOLUTION_OPTIONS.map((opt, i) =>
        h('button', {
          class: [
            'bg-transparent hover:bg-gray-700',
            'text-white',
            'cursor-pointer px-3 py-1 rounded text-2xl',
            'w-[52px] h-[42px] flex items-center justify-center'
          ].join(' '),
          'data-value': opt.value,
          title: `${opt.title} (${i + 1} or Shift+${i + 1})`
        }, opt.label)
      )
    ),
    // Subsection 3: Dotted & Triplet toggles
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md'
    },
      h('button', {
        id: 'dotted-note-btn',
        class: [
          'bg-transparent hover:bg-purple-700',
          'text-white',
          'cursor-pointer px-3 py-1 rounded text-2xl font-semibold',
          'w-[52px] h-[42px] flex items-center justify-center'
        ].join(' '),
        title: 'Toggle Dotted Note (.)'
      }, '•'),

      h('button', {
        id: 'triplet-note-btn',
        class: [
          'bg-transparent hover:bg-purple-700',
          'text-white',
          'cursor-pointer px-3 py-1 rounded text-2xl font-semibold',
          'w-[52px] h-[42px] flex items-center justify-center'
        ].join(' '),
        title: 'Toggle Triplet (/)' 
      }, '³')
    )
  );

  // AI Options Group (Initially hidden)

  const autocompleteBtn = h('button', {
    id: 'autocomplete-toggle-btn',
    class: 'bg-transparent hover:bg-purple-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'AI Autocomplete (G/Shift+G)'
  }, icon('icon-cursor-arrow-rays', 'Toggle Autocomplete'));

  // Register autocomplete button globally (For disabling/enabling)
  setAutocompleteToggleButton(autocompleteBtn);

  const aiOptionsGroup = h('div', { class: 'flex gap-4 hidden' },

    // Subsection 1: AI Tools Button (Popover later)
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md'
    },
      h('button', {
        id: 'ai-tools-btn',
        class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
        title: 'AI Tools'
      }, icon('icon-chip', 'AI Tools'))
    ),

    // Subsection 2: Autocomplete controls
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md'
    },
      autocompleteBtn,
      h('button', {
        id: 'autocomplete-approve-btn',
        class: 'bg-transparent hover:bg-green-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
        title: 'Approve (Tab)'
      }, icon('icon-thumbs-up', 'Approve Autocomplete')),
    ),

    // Subsection 3: Extend & Paint tools (placeholders for now)
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md'
    },
      h('button', {
        id: 'ai-extend-before-btn',
        class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
        title: 'AI Extend Before (SHIFT+1)'
      }, icon('icon-double-arrow-left', 'AI Extend Before')),

      h('button', {
        id: 'ai-paint-btn',
        class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
        title: 'AI Paint Tool (SHIFT+2)'
      }, icon('icon-paint-brush', 'AI Paint')),

      h('button', {
        id: 'ai-extend-after-btn',
        class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
        title: 'AI Extend After (SHIFT+3)'
      }, icon('icon-double-arrow-right', 'AI Extend After'))
    ),

    // Subsection 4: Advanced / Debug (placeholders for now)
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md'
    },
      h('button', {
        id: 'ai-adjust-prompt-btn',
        class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
        title: 'Adjust AI Prompt Settings'
      }, icon('icon-adjust-ai-prompt', 'Adjust AI Prompt')),

      h('button', {
        id: 'ai-debugger-btn',
        class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
        title: 'AI Debugger'
      }, icon('icon-command-line', 'AI Debugger'))
    )
  );

  // Add both groups to the toolbar element
  toolbarEl.appendChild(noteOptionsGroup);
  toolbarEl.appendChild(aiOptionsGroup);

  return {
    element: toolbarEl,
    refreshGridSettings: gridSettings.refreshToggles,
    noteOptionsGroup,
    aiOptionsGroup
  };
}
