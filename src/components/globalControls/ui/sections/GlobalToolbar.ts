// src/components/globalControls/ui/sections/GlobalToolbar.ts

import { setAutocompleteToggleButton } from '@/components/globalControls/controls/autoCompleteButtonControls.js';

import { h } from '@/shared/ui/domUtils.js';
import { createEditorSelectorPopover } from '@/components/globalControls/ui/prefabs/editorSelectorPopover.js';
import { createGridSettingsPopover } from '@/components/globalControls/ui/prefabs/gridSettingsPopover.js';
import { createHotkeyPopover } from '@/components/globalControls/ui/prefabs/hotkeyPopover.js';
import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';
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

  const noteModeBtn = h('button', {
    id: 'note-mode-btn',
    class: 'bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700 text-sm font-semibold w-[52px] h-[42px] flex items-center justify-center',
    style: 'cursor: pointer;',
    title: 'Drawing Toolbar'
  }, icon('icon-pen', 'Note Mode'));
  createHotkeyPopover(noteModeBtn, 'SwitchToNoteMode');

  const aiModeBtn = h('button', {
    id: 'ai-mode-btn',
    class: 'bg-gray-800 px-3 py-1 rounded text-white hover:bg-purple-700 text-sm font-semibold w-[52px] h-[42px] flex items-center justify-center',
    style: 'cursor: pointer;',
    title: 'AI Toolbar'
  }, icon('icon-brain-white', 'AI Mode'));
  createHotkeyPopover(aiModeBtn, 'SwitchToAIMode');

  const toolbarEl = h('div', {
    class: 'flex flex-wrap justify-center items-center gap-4 p-4'
  },
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md cursor-pointer'
    },
      noteModeBtn,
      aiModeBtn
    )
  );

  const durationButtons = NOTE_RESOLUTION_OPTIONS.map((opt, i) => {
    const btn = h('button', {
      id: `note-duration-btn-${i}`,
      class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded text-2xl w-[52px] h-[42px] flex items-center justify-center',
      'data-value': opt.value,
      title: opt.title
    }, opt.label);
    createHotkeyPopover(btn, `ApplyDuration${i + 1}` as KeyMacroName);
    return btn;
  });

  const dottedBtn = h('button', {
    id: 'dotted-note-btn',
    class: 'bg-transparent hover:bg-purple-700 text-white cursor-pointer px-3 py-1 rounded text-2xl font-semibold w-[52px] h-[42px] flex items-center justify-center',
    title: 'Toggle Dotted Note'
  }, '•');
  createHotkeyPopover(dottedBtn, 'ToggleDottedNotes');

  const tripletBtn = h('button', {
    id: 'triplet-note-btn',
    class: 'bg-transparent hover:bg-purple-700 text-white cursor-pointer px-3 py-1 rounded text-2xl font-semibold w-[52px] h-[42px] flex items-center justify-center',
    title: 'Toggle Triplet'
  }, '³');
  createHotkeyPopover(tripletBtn, 'ToggleTripletNotes');

  const noteOptionsGroup = h('div', { class: 'flex gap-4' },
    h('div', {
      class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md cursor-pointer'
    },
      gridSettings.trigger,
      createEditorSelectorPopover()
    ),
    h('div', { class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md' },
      ...durationButtons
    ),
    h('div', { class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md' },
      dottedBtn,
      tripletBtn
    )
  );

  const autocompleteBtn = h('button', {
    id: 'autocomplete-toggle-btn',
    class: 'bg-transparent hover:bg-purple-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'AI Autocomplete'
  }, icon('icon-cursor-arrow-rays', 'Toggle Autocomplete'));
  setAutocompleteToggleButton(autocompleteBtn);
  createHotkeyPopover(autocompleteBtn, 'AIStartAutocomplete');

  const aiToolsBtn = h('button', {
    id: 'ai-tools-btn',
    class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'AI Tools'
  }, icon('icon-chip', 'AI Tools'));
  createHotkeyPopover(aiToolsBtn, 'AIToolsMenu');

  const autocompleteApproveBtn = h('button', {
    id: 'autocomplete-approve-btn',
    class: 'bg-transparent hover:bg-green-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'Approve'
  }, icon('icon-thumbs-up', 'Approve Autocomplete'));
  createHotkeyPopover(autocompleteApproveBtn, 'ApproveAutocomplete');

  const extendBeforeBtn = h('button', {
    id: 'ai-extend-before-btn',
    class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'AI Extend Before'
  }, icon('icon-double-arrow-left', 'AI Extend Before'));
  createHotkeyPopover(extendBeforeBtn, 'AIExtendBefore');

  const aiPaintBtn = h('button', {
    id: 'ai-paint-btn',
    class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'AI Paint Tool'
  }, icon('icon-paint-brush', 'AI Paint'));
  createHotkeyPopover(aiPaintBtn, 'AIPaint');

  const extendAfterBtn = h('button', {
    id: 'ai-extend-after-btn',
    class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'AI Extend After'
  }, icon('icon-double-arrow-right', 'AI Extend After'));
  createHotkeyPopover(extendAfterBtn, 'AIExtendAfter');

  const adjustPromptBtn = h('button', {
    id: 'ai-adjust-prompt-btn',
    class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'Adjust AI Prompt Settings'
  }, icon('icon-adjust-ai-prompt', 'Adjust AI Prompt'));
  createHotkeyPopover(adjustPromptBtn, 'AIAdjustPrompt');

  const aiDebuggerBtn = h('button', {
    id: 'ai-debugger-btn',
    class: 'bg-transparent hover:bg-gray-700 text-white cursor-pointer px-3 py-1 rounded w-[52px] h-[42px] flex items-center justify-center',
    title: 'AI Debugger'
  }, icon('icon-command-line', 'AI Debugger'));
  createHotkeyPopover(aiDebuggerBtn, 'AIDebugger');

  const aiOptionsGroup = h('div', { class: 'flex gap-4 hidden' },
    h('div', { class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md' },
      aiToolsBtn
    ),
    h('div', { class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md' },
      autocompleteBtn,
      autocompleteApproveBtn
    ),
    h('div', { class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md' },
      extendBeforeBtn,
      aiPaintBtn,
      extendAfterBtn
    ),
    h('div', { class: 'flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md' },
      adjustPromptBtn,
      aiDebuggerBtn
    )
  );

  toolbarEl.appendChild(noteOptionsGroup);
  toolbarEl.appendChild(aiOptionsGroup);

  return {
    element: toolbarEl,
    refreshGridSettings: gridSettings.refreshToggles,
    noteOptionsGroup,
    aiOptionsGroup
  };
}

