// src/components/globalControls/modals/saveModal/saveModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';

/**
 * Renders the UI for the Save/Export modal.
 * @returns The root HTMLElement of the modal and the drag-midi button.
 */
export function createSaveModal(): { root: HTMLElement, dragMidiBtn: HTMLButtonElement } {
  const header = createHeader('💾 Export');

  const saveJsonBtn = createButton({
    id: 'export-json',
    text: 'Save Project',
    kind: 'primary'
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

  // === New Drag MIDI Button ===
  const dragMidiBtn = h('button', {
    id: 'drag-midi',
    draggable: 'true',
    class: [
      'drag-midi-btn',
      'cursor-grab select-none',
      'px-2 py-1 rounded w-8 flex items-center justify-center',
      'transition-transform transition-opacity duration-150',
      'hover:scale-105 hover:brightness-110 active:cursor-grabbing',
      'bg-yellow-700 hover:bg-yellow-600 text-white',
      'border border-yellow-500'
    ].join(' '),
    title: 'Drag entire song as MIDI file to Desktop'
  }, '🎵') as HTMLButtonElement;

  const exportMidiRow = h('div', {
    class: 'flex items-center gap-2'
  }, exportMidiBtn, dragMidiBtn);

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
    exportMidiRow
  );

  const root = createFloatingModal('export-modal', [
    header,
    buttonGroup,
    cancelBtn
  ]);

  return { root, dragMidiBtn };
}

