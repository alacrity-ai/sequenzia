// src/components/userSettings/ui/sections/AISettingsSection.ts

import { h } from '@/shared/ui/domUtils.js';
import { OPENAI_MODELS } from '@/components/userSettings/settings/aiConstants.js';
import { updateUserConfig, getAIIndicatorEnabled } from '@/components/userSettings/store/userConfigStore.js';
import { createTooltipPair } from '@/shared/ui/primitives/createTooltipPair.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { createLabel } from '@/shared/ui/primitives/createLabel.js';
import { createParagraph } from '@/shared/ui/primitives/createParagraph.js';
import { createToggleSwitch, ToggleSwitchController } from '@/shared/ui/primitives/createToggleSwitch.js';

export interface AISettingsSectionController {
  element: HTMLElement;
  refreshToggle: () => void;
}

export function createAISettingsSection(): AISettingsSectionController {
  const modelOptions = OPENAI_MODELS.map(model =>
    h('option', {
      value: model.value,
      className: model.className,
      textContent: model.label
    })
  );

  // AI Track Indicator Toggle
  const aiTrackIndicatorToggle: ToggleSwitchController = createToggleSwitch({
    id: 'ai-track-indicator-toggle',
    label: 'AI Track Indicator:',
    stateA: 'Off',
    stateB: 'On'
  });

  aiTrackIndicatorToggle.input.addEventListener('change', () => {
    updateUserConfig({ ai: { indicatorEnabled: aiTrackIndicatorToggle.getChecked() } });
  });

  const refreshToggle = () => {
    aiTrackIndicatorToggle.setChecked(getAIIndicatorEnabled());
  };

  // Tooltip: API Key
  const { trigger: apiKeyTooltipTrigger, tooltip: apiKeyTooltip } = createTooltipPair(
    'tooltip-openai-key',
    '?',
    [
      'You must provide an OpenAI API key to use AI features.',
      createParagraph(
        'Visit ',
        h('a', {
          href: 'https://platform.openai.com/account/api-keys',
          target: '_blank',
          className: 'text-blue-400 underline hover:text-blue-300'
        }, 'platform.openai.com'),
        ' to manage your key.'
      )
    ]
  );

  // Tooltip: Model Select
  const { trigger: modelTooltipTrigger, tooltip: modelTooltip } = createTooltipPair(
    'tooltip-openai-model',
    '?',
    [
      'Different models offer varying performance and response quality.',
      createParagraph(
        'Models marked in ',
        h('span', { class: 'text-green-400 font-semibold' }, 'green'),
        ' are recommended for best results.'
      ),
      'We will add support for new models as they become available.'
    ]
  );

  const section = h('div', {},
    createHeader('AI Configuration'),

    // API Key Input
    h('div', { class: 'mb-6' },
      createLabel('OpenAI API Key', apiKeyTooltipTrigger),
      h('input', {
        type: 'password',
        id: 'openai-key-input',
        placeholder: 'sk-...',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500'
      }),
      apiKeyTooltip
    ),

    // Model Select
    h('div', { class: 'mb-8' },
      createLabel('OpenAI Model', modelTooltipTrigger),
      h('select', {
        id: 'openai-model-select',
        className: 'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer'
      }, ...modelOptions),
      modelTooltip
    ),

    // AI Track Indicator Toggle
    h('div', { class: 'mb-8' },
      aiTrackIndicatorToggle.element
    )
  );

  return {
    element: section,
    refreshToggle
  };
}
