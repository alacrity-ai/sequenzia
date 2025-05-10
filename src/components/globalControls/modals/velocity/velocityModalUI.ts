// src/globalControls/modals/velocity/velocityModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';

/**
 * Renders the UI for the Velocity Adjustment modal.
 * @returns The root HTMLElement of the modal.
 */
export function createVelocityModal(): HTMLElement {
  // === Header
  const header = h('h2', {
    class: 'text-xl font-semibold mb-2 z-10 text-center',
    textContent: 'Adjust Velocity'
  });

  const subtext = h('p', {
    class: 'text-sm text-gray-400 mb-4 text-center z-10',
    textContent: 'Apply a velocity transformation to the selected notes.'
  });

  // === Set Base Velocity Section
  const setToggle = h('input', {
    id: 'velocity-set-toggle',
    type: 'checkbox',
    class: 'accent-purple-500',
    checked: true
  });

  const setLabel = h('label', {
    class: 'flex items-center gap-2 text-sm mb-2'
  }, setToggle, 'Set base velocity to');

  const velocityActionSelect = h('select', {
    id: 'velocity-action-select',
    class: 'flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 cursor-pointer'
  },
    h('option', { value: 'set' }, 'Set Velocity To'),
    h('option', { value: 'increase' }, 'Increase Velocity By'),
    h('option', { value: 'decrease' }, 'Decrease Velocity By')
  );

  const velocityValueInput = h('input', {
    id: 'velocity-value-input',
    type: 'number',
    value: '100',
    min: '1',
    max: '127',
    class: 'w-[100px] bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500'
  });

  const velocityFields = h('div', {
    id: 'velocity-set-fields',
    class: 'flex items-center gap-3'
  }, velocityActionSelect, velocityValueInput);

  const setSection = h('div', { class: 'z-10 mb-4' }, setLabel, velocityFields);

  // === Ramp Section
  const rampToggle = h('input', {
    id: 'velocity-ramp-toggle',
    type: 'checkbox',
    class: 'accent-purple-500'
  });

  const rampLabel = h('label', {
    class: 'flex items-center gap-2 text-sm mb-2'
  }, rampToggle, 'Enable velocity ramp');

  const rampDirectionSelect = h('select', {
    id: 'velocity-ramp-direction',
    class: 'flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 cursor-pointer'
  },
    h('option', { value: 'up' }, 'Ramp Up'),
    h('option', { value: 'down' }, 'Ramp Down')
  );

  const rampAmountInput = h('input', {
    id: 'velocity-ramp-amount',
    type: 'number',
    value: '10',
    min: '1',
    max: '127',
    placeholder: 'Δ per note',
    class: 'w-[100px] bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500'
  });

  const rampModeRadios = h('div', {
    class: 'flex items-center gap-2 mb-4 text-sm text-gray-300'
  },
    h('label', { class: 'flex items-center gap-1' },
      h('input', {
        type: 'radio',
        name: 'ramp-mode',
        value: 'linear',
        checked: true,
        class: 'accent-purple-500'
      }),
      'Linear'
    ),
    h('label', { class: 'flex items-center gap-1' },
      h('input', {
        type: 'radio',
        name: 'ramp-mode',
        value: 'exponential',
        class: 'accent-purple-500'
      }),
      'Exponential'
    )
  );

  const rampFields = h('div', {
    id: 'velocity-ramp-fields',
    class: 'opacity-50 pointer-events-none'
  },
    h('div', { class: 'flex items-center gap-3 mb-2' }, rampDirectionSelect, rampAmountInput),
    rampModeRadios
  );

  const rampSection = h('div', {
    class: 'border-t border-gray-700 pt-4 mt-4 z-10'
  }, rampLabel, rampFields);

  // === Randomization Section
  const randomToggle = h('input', {
    id: 'velocity-randomize-toggle',
    type: 'checkbox',
    class: 'accent-purple-500'
  });

  const randomLabel = h('label', {
    class: 'flex items-center gap-2 text-sm mb-2'
  }, randomToggle, 'Add random variation');

  const randomRangeInput = h('input', {
    id: 'velocity-random-range',
    type: 'number',
    value: '5',
    min: '1',
    max: '64',
    class: 'w-[80px] bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500'
  });

  const randomRow = h('div', {
    id: 'velocity-random-fields',
    class: 'flex items-center gap-2 text-sm text-gray-300 opacity-50 pointer-events-none'
  },
    h('span', { textContent: '±' }),
    randomRangeInput
  );

  const randomSection = h('div', {
    class: 'border-t border-gray-700 pt-4 mt-4 z-10'
  }, randomLabel, randomRow);

  // === Preview
  const previewSummary = h('div', {
    id: 'velocity-preview-summary',
    class: 'mt-6 text-sm text-gray-400 text-center z-10'
  });

  // === Buttons
  const applyBtn = createButton({
    id: 'velocity-apply-btn',
    text: 'Apply',
    kind: 'primary'
  });

  const cancelBtn = createButton({
    id: 'velocity-cancel-btn',
    text: 'Cancel',
    kind: 'tertiary'
  });

  const buttonsRow = h('div', {
    class: 'flex gap-3 mt-6 z-10'
  }, applyBtn, cancelBtn);

  // === Final Layout
  return createFloatingModal('velocity-modal', [
    header,
    subtext,
    setSection,
    rampSection,
    randomSection,
    previewSummary,
    buttonsRow
  ]);
}
