// src/components/globalControls/modals/loadModal/loadModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';

/**
 * Renders the UI for the Load Project modal.
 * @returns The root HTMLElement of the modal.
 */
export function createLoadModal(): HTMLElement {
  const header = createHeader('📁 Load Project');

  const importJsonBtn = createButton({
    id: 'import-json',
    text: 'Load Project',
    kind: 'primary'
  });

  const divider = h('div', { class: 'h-px bg-gray-600' });

  const importMidiBtn = createButton({
    id: 'import-midi',
    text: 'Import MIDI',
    kind: 'secondary',
    additionalClasses: 'bg-yellow-600 hover:bg-yellow-700'
  });

  const cancelBtn = createButton({
    id: 'import-cancel',
    text: 'Cancel',
    kind: 'tertiary',
    additionalClasses: 'mt-6 w-full'
  });

  const buttonGroup = h('div', { class: 'flex flex-col gap-3 w-full z-10' },
    importJsonBtn,
    divider,
    importMidiBtn
  );

  return createFloatingModal('import-modal', [
    header,
    buttonGroup,
    cancelBtn
  ]);
}
