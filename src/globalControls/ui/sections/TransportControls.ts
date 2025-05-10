import { h } from '@/shared/ui/domUtils.js';
import { createToggleSwitch } from '@/shared/ui/primitives/createToggleSwitch.js';
import { createVerticalDivider } from '@/shared/ui/primitives/createVerticalDivider.js';
import { createCircularIconButton } from '@/shared/ui/primitives/createCircularIconButton.js';
import { createNumberInput } from '@/shared/ui/primitives/createNumberInput.js';
import { createLabel } from '@/shared/ui/primitives/createLabel.js';
import { createSpacer } from '@/shared/ui/primitives/createSpacer.js';
import { createKeySelectorPopover } from '@/shared/ui/prefabs/keySelectorPopover.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';

export function createTransportControls(): HTMLElement {
  // === 🔁 Key selector prefab: extract trigger and deferred mount
  const triggerBtn = createKeySelectorPopover();

  const element = h('div', {
    class: 'flex justify-center items-center gap-4 flex-wrap'
  },

    // === Section 1: Playback & Recording ===
    h('div', { class: 'flex items-center gap-2' },
      createCircularIconButton('play-button',
        'Play/Pause', icon('icon-play', 'Play'), 'bg-blue-600', 'hover:bg-blue-700'),
      createCircularIconButton('stop-button',
        'Stop', icon('icon-stop', 'Stop'), 'bg-blue-600', 'hover:bg-blue-700'),

      createSpacer('4'),

      createCircularIconButton('record-button',
        'Record', icon('icon-record', 'Record'), 'bg-red-600', 'hover:bg-red-700'),

      createSpacer('4'),
      createToggleSwitch({
        id: 'loop-toggle',
        stateB: 'Loop',
        inline: true
      }),

      createSpacer('4'),
      createVerticalDivider(),
    ),

    // === Section 2: Timing ===
    h('div', {
      class: 'flex items-center gap-4 px-3 py-2 rounded-xl bg-gray-900/80 backdrop-blur-sm shadow-md'
    },
      // Key Selector
      h('div', { class: 'flex flex-col items-start gap-1' },
        createLabel('Key'),
        triggerBtn
      ),

      // Tempo
      h('div', { class: 'flex flex-col items-start gap-1' },
        createLabel('Tempo'),
        createNumberInput({
          id: 'tempo-input',
          min: 20,
          max: 300,
          value: 120
        })
      ),

      // Measures
      h('div', { class: 'flex flex-col items-start gap-1' },
        createLabel('Measures'),
        createNumberInput({
          id: 'measures-input',
          min: 1,
          max: 1000,
          value: 8
        })
      ),

      // Beats per Measure
      h('div', { class: 'flex flex-col items-start gap-1' },
        createLabel('Beats'),
        createNumberInput({
          id: 'beats-per-measure-input',
          min: 1,
          max: 16,
          value: 4
        })
      )
    ),

    createVerticalDivider(),

    // === Section 3: File & Config ===
    h('div', { class: 'flex items-center gap-2' },
      createSpacer('4'),

      createCircularIconButton('save-button',
        'Save', icon('icon-save', 'Save'), 'bg-green-600', 'hover:bg-green-700'),
      createCircularIconButton('load-button',
        'Load', icon('icon-load', 'Load'), 'bg-yellow-600', 'hover:bg-yellow-700'),

      createSpacer('4'),

      createCircularIconButton('config-button',
        'User Settings', icon('icon-user-settings', 'Settings'), 'bg-purple-600', 'hover:bg-purple-700')
    )
  );

  return element;
}
