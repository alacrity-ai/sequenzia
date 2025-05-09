// src/globalControls/modals/saveModal/saveModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';

/**
 * Renders the UI for the Save/Export modal.
 * @returns The root HTMLElement of the modal.
 */
export function createSaveModal(): HTMLElement {
  const header = createHeader('💾 Export');

  const saveJsonBtn = createButton({
    id: 'export-json',
    text: 'Save Project',
    kind: 'primary' // Skin-mapped primary (e.g. purple)
  });

  const divider = h('div', { class: 'h-px bg-gray-600' });

  const exportWavBtn = createButton({
    id: 'export-wav',
    text: 'Export as WAV',
    kind: 'secondary',
    additionalClasses: 'bg-green-600 hover:bg-green-700'
  });

  const exportMidiBtn = createButton({
    id: 'export-midi',
    text: 'Export as MIDI',
    kind: 'secondary',
    additionalClasses: 'bg-yellow-600 hover:bg-yellow-700'
  });

  const cancelBtn = createButton({
    id: 'export-cancel',
    text: 'Cancel',
    kind: 'tertiary',
    additionalClasses: 'mt-6 w-full'
  });

  const buttonGroup = h('div', { class: 'flex flex-col gap-3 w-full z-10' },
    saveJsonBtn,
    divider,
    exportWavBtn,
    exportMidiBtn
  );

  return createFloatingModal('export-modal', [
    header,
    buttonGroup,
    cancelBtn
  ]);
}
