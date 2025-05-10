// src/globalControls/ui/sections/GlobalToolbar.ts

import { h } from '@/shared/ui/domUtils.js';
import { createEditorSelectorPopover } from '@/components/globalControls/ui/prefabs/editorSelectorPopover.js';
import { createGridSettingsPopover } from '@/components/globalControls/ui/prefabs/gridSettingsPopover.js';
import { NOTE_RESOLUTION_OPTIONS } from '@/components/globalControls/constants.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';

export function createGlobalToolbar(): HTMLElement {
  return h('div', {
    class: 'flex flex-wrap justify-center items-center gap-4 p-4'
  },

    // Group 1: Mode toggles
    h('div', {
        class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md cursor-pointer'
    },
        h('button', {
        id: 'note-mode-btn',
        class: 'bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700 text-sm font-semibold w-[52px] h-[42px] flex items-center justify-center',
        style: 'cursor: pointer;'
        }, icon('icon-pen', 'Note Mode')),
    
        h('button', {
        id: 'ai-mode-btn',
        class: 'bg-gray-800 px-3 py-1 rounded text-white hover:bg-purple-700 text-sm font-semibold w-[52px] h-[42px] flex items-center justify-center',
        style: 'cursor: pointer;'
        }, icon('icon-brain-white', 'AI Mode'))
    ),
    
    // Group 2: Placement/editing toggles
    h('div', {
        class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md cursor-pointer'
    },
        createGridSettingsPopover(),
        // h('button', {
        // id: 'note-placement-options-btn',
        // class: 'bg-gray-800 px-3 py-1 rounded text-white hover:bg-purple-700 w-[52px] h-[42px] flex items-center justify-center',
        // style: 'cursor: pointer;'
        // }, icon('icon-music', 'Placement')),
        
        createEditorSelectorPopover()
    ),
  
    // Group 3: Duration buttons
    h('div', {
        class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md'
    },
        ...NOTE_RESOLUTION_OPTIONS.map(opt =>
        h('button', {
            class: [
            'bg-transparent hover:bg-gray-700',
            'text-white',
            'cursor-pointer px-3 py-1 rounded text-2xl',
            'w-[52px] h-[42px] flex items-center justify-center'
            ].join(' '),
            'data-value': opt.value,
            title: opt.label
        }, opt.label)
        )
    ),
    
    // Group 4: Dotted & Triplet modifiers
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
    ),
  
  );
}
