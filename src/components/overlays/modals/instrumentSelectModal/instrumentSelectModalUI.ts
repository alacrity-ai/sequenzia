// src/components/overlays/modals/instrumentSelectModal/instrumentSelectModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { createToggleSwitch } from '@/shared/ui/primitives/createToggleSwitch.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';
import { createLabel } from '@/shared/ui/primitives/createLabel.js';

/**
 * Creates the Instrument Select Modal UI.
 * Root element is #instrument-select-modal.
 */
export function createInstrumentSelectModal(): HTMLElement {
  const skin = getCurrentSkin();

  const header = createHeader({
    text: 'Select Instrument',
    size: 'xl',
    additionalClasses: 'text-center mb-6 z-10'
  });

  const createFullWidthSelect = (id: string, labelText: string) => {
    const selectEl = h('select', {
      id,
      class: [
        'w-full bg-gray-700 border border-gray-600 rounded px-3 py-2',
        'focus:outline-none focus:border-purple-500 cursor-pointer',
        skin.textColor
      ].join(' ')
    });

    const wrapper = h('div', { class: 'mb-4 z-10 w-full' },
      createLabel({ text: labelText, for: id }),
      selectEl
    );

    return wrapper;
  };

  const engineSelect = createFullWidthSelect('instrument-engine-select', 'Engine');
  const librarySelect = createFullWidthSelect('instrument-library-select', 'Instrument Library');
  const instrumentSelect = createFullWidthSelect('instrument-select', 'Instrument');

  const loopToggle = createToggleSwitch({
    id: 'instrument-loop-toggle',
    label: 'Loop instrument sound',
    stateB: 'On'
  });

  const confirmButton = createButton({
    id: 'instrument-select-confirm',
    text: 'Select',
    kind: 'primary',
    additionalClasses: 'flex-1 py-2 text-sm rounded-lg'
  });

  const cancelButton = createButton({
    id: 'instrument-cancel-btn',
    text: 'Cancel',
    kind: 'secondary',
    additionalClasses: 'flex-1 py-2 text-sm rounded-lg'
  });

  const buttonRow = h('div', { class: 'flex gap-3 z-10 w-full' }, confirmButton, cancelButton);

  const modalContent = [
    header,
    engineSelect,
    librarySelect,
    instrumentSelect,
    loopToggle.element,
    buttonRow
  ];

  const modal = createFloatingModal('instrument-select-modal', modalContent, { sizePreset: 'md' });

  return modal;
}
