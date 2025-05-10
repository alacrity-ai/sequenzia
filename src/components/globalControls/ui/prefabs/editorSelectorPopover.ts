// src/globalControls/ui/prefabs/editorSelectorPopover.ts

import { h } from '@/shared/ui/domUtils.js';
import { createPopover } from '@/shared/ui/primitives/createPopover.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';

interface EditorOption {
  id: string;
  label: string;
  iconName: string;
  hotkey?: string | null;
  disabled?: boolean;
}


const editors: EditorOption[] = [
  { id: 'velocity-tool', label: 'Velocity Tool', iconName: 'icon-cog', hotkey: 'V' },
  { id: 'quantize-tool', label: 'Quantize Tool', iconName: 'icon-cog', hotkey: 'Q', disabled: true },
  { id: 'transpose-tool', label: 'Transpose Tool', iconName: 'icon-cog', hotkey: 'T', disabled: true },

  { id: 'chordifier', label: 'Chordifier', iconName: 'icon-adjustments-vertical', hotkey: 'Shift+C', disabled: true },
  { id: 'humanizer', label: 'Humanizer', iconName: 'icon-adjustments-vertical', hotkey: 'Shift+H', disabled: true }
];


export function createEditorSelectorPopover(): HTMLElement {
  const skin = getCurrentSkin();

  const triggerButton = h('button', {
    id: 'note-editing-options-btn',
    class: 'bg-gray-800 px-3 py-1 rounded text-white hover:bg-purple-700 w-[52px] h-[42px] flex items-center justify-center',
    style: 'cursor: pointer;',
    title: 'Tools'
  }, icon('icon-chart-bar', 'Editing'));

  let instance: ReturnType<typeof createPopover>['instance'];

  const contentBody = [
    h('div', {
      class: 'max-h-72 overflow-y-auto flex flex-col gap-1'
    },
      ...editors.flatMap((editor, index) => {
        const isBreakAfter = index === 2;

        const button = h('button', {
          class: [
            'flex items-center justify-between gap-2 px-3 py-2 text-sm rounded text-left transition-colors',
            editor.disabled
              ? 'text-gray-500 bg-gray-700/30 cursor-not-allowed opacity-50'
              : 'text-white hover:bg-purple-700 cursor-pointer'
          ].join(' '),
          ...(editor.disabled ? {} : {
            onClick: () => {
              const event = new CustomEvent('editor-invoke', {
                detail: { editorId: editor.id },
                bubbles: true
              });
              triggerButton.dispatchEvent(event);

              requestAnimationFrame(() => {
                instance?.hide();
              });
            }
          })
        },
          h('div', { class: 'flex items-center gap-2' },
            icon(editor.iconName, editor.label),
            h('span', { textContent: editor.label })
          ),
          editor.hotkey
            ? h('span', {
                class: 'text-xs text-gray-400 font-mono',
                textContent: editor.hotkey
              })
            : null
        );

        return isBreakAfter
          ? [button, h('div', { class: `my-2 border-t ${skin.borderColor} mx-2` })]
          : [button];
      })
    )
  ];

  const popover = createPopover(triggerButton, contentBody, {
    title: 'Tools',
    placement: 'bottom',
    triggerType: 'click'
  });

  instance = popover.instance;

  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  // Hook into lifecycle
  instance.updateOnShow(() => {
    keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.length === 1) {
        instance?.hide();
      }
    };
    document.addEventListener('keydown', keydownHandler, { once: true });
  });

  instance.updateOnHide(() => {
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
  });

  return triggerButton;
}
