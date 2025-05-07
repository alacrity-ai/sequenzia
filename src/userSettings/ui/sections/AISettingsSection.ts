// src/userSettings/ui/sections/AISettingsSection.ts

import { h } from '../../../shared/ui/domUtils.js';
import { OPENAI_MODELS } from '../../settings/aiConstants.js';
import { createTooltipPair } from '../../../shared/ui/primitives/createTooltipPair.js';

export function createAISettingsSection(): HTMLElement {
  const modelOptions = OPENAI_MODELS.map(model =>
    h('option', {
      value: model.value,
      className: model.className,
      textContent: model.label
    })
  );

  // Tooltip: API Key
  const { trigger: apiKeyTooltipTrigger, tooltip: apiKeyTooltip } = createTooltipPair(
    'tooltip-openai-key',
    '?',
    [
      h('p', {}, 'You must provide an OpenAI API key to use AI features.'),
      h('p', {}, [
        'Visit ',
        h('a', {
          href: 'https://platform.openai.com/account/api-keys',
          target: '_blank',
          className: 'text-blue-400 underline hover:text-blue-300'
        }, 'platform.openai.com'),
        ' to manage your key.'
      ])
    ]
  );

  // Tooltip: Model select
  const { trigger: modelTooltipTrigger, tooltip: modelTooltip } = createTooltipPair(
    'tooltip-openai-model',
    '?',
    [
      h('p', {}, 'Different models offer varying performance and response quality.'),
      h('p', {}, [
        'Models marked in ',
        h('span', { class: 'text-green-400 font-semibold' }, 'green'),
        ' are recommended for best results.'
      ]),
      h('p', {}, 'We will add support for new models as they become available.')
    ]
  );

  return h('div', {},
    h('h2', {
      className: 'text-lg font-semibold mb-4',
      textContent: 'AI Configuration'
    }),

    // API Key Input
    h('div', { className: 'mb-6' },
      h('label', {
        className: 'block text-sm font-medium mb-2 flex items-center gap-2',
      },
        'OpenAI API Key',
        apiKeyTooltipTrigger
      ),
      h('input', {
        type: 'password',
        id: 'openai-key-input',
        placeholder: 'sk-...',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500'
      }),
      apiKeyTooltip
    ),

    // Model Select
    h('div', { className: 'mb-8' },
      h('label', {
        className: 'block text-sm font-medium mb-2 flex items-center gap-2',
      },
        'OpenAI Model',
        modelTooltipTrigger
      ),
      h('select', {
        id: 'openai-model-select',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer'
      },
        ...modelOptions
      ),
      modelTooltip
    )
  );
}
