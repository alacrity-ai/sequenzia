// src/shared/ui/primitives/createLabeledToggle.ts

import { h } from '../domUtils.js';

/**
 * Creates a horizontal toggle row:
 * [Label]
 * [State A Label] [toggle] [State B Label] [optional tooltip trigger]
 */
export function createLabeledToggle(options: {
    id: string;
    label: string;
    stateA: string;
    stateB: string;
    tooltipTrigger?: HTMLElement;
  }): HTMLElement {
    const { id, label, stateA, stateB, tooltipTrigger } = options;
  
    const toggle = h('div', { class: 'mb-6' },
      h('label', {
        class: 'block text-sm font-medium mb-2 text-white',
        textContent: label
      }),
      h('div', { class: 'flex items-center gap-3' },
        h('span', {
          class: 'text-sm text-white',
          textContent: stateA
        }),
        h('label', {
          class: 'relative inline-flex items-center cursor-pointer'
        },
          h('input', {
            id,
            type: 'checkbox',
            class: 'sr-only peer'
          }),
          h('div', {
            class: [
              'w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600',
              'after:content-[""] after:absolute after:top-[2px] after:left-[2px]',
              'after:bg-white after:border-gray-300 after:border after:rounded-full',
              'after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full',
              'peer-checked:after:border-white'
            ].join(' ')
          })
        ),
        h('span', {
          class: 'text-sm text-white',
          textContent: stateB
        }),
        tooltipTrigger ?? null
      )
    );
  
    return toggle;
  }
  