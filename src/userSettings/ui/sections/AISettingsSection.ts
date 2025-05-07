// src/userSettings/ui/sections/AISettingsSection.ts

import { h } from '../../../shared/ui/domUtils.js';
import { OPENAI_MODELS } from '../../settings/aiConstants.js';

export function createAISettingsSection(): HTMLElement {
  const modelOptions = OPENAI_MODELS.map(model =>
    h('option', {
      value: model.value,
      className: model.className,
      textContent: model.label
    })
  );

  return h('div', {},
    h('h2', {
      className: 'text-lg font-semibold mb-4',
      textContent: 'AI Configuration'
    }),

    // API Key Input
    h('div', { className: 'mb-6' },
      h('label', {
        className: 'block text-sm font-medium mb-2',
        textContent: 'OpenAI API Key'
      }),
      h('input', {
        type: 'password',
        id: 'openai-key-input',
        placeholder: 'sk-...',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500'
      })
    ),

    // Model Select
    h('div', { className: 'mb-8' },
      h('label', {
        className: 'block text-sm font-medium mb-2',
        textContent: 'OpenAI Model'
      }),
      h('select', {
        id: 'openai-model-select',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer'
      },
        ...modelOptions
      )
    )
  );
}
