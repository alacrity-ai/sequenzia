// src/userSettings/listeners/attachThemeSettingsListeners.ts
import { getUserConfig, updateUserConfig } from '../store/userConfigStore.js';
import type { ListenerAttachment } from '../interfaces/ListenerAttachment.js';

export function attachThemeSettingsListeners(sectionEl: HTMLElement): ListenerAttachment  {
  const gridSelect = sectionEl.querySelector('#grid-color-select') as HTMLSelectElement | null;
  const noteSelect = sectionEl.querySelector('#note-color-select') as HTMLSelectElement | null;

  const refreshUI = () => {
    const config = getUserConfig();
    if (gridSelect) {
      gridSelect.value = config.theme.gridColorScheme || gridSelect.options[0]?.value || '';
    }
    if (noteSelect) {
      noteSelect.value = config.theme.noteColorScheme || noteSelect.options[0]?.value || '';
    }
  };

  const handleGridChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    updateUserConfig({ theme: { gridColorScheme: target.value } });
  };

  const handleNoteChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    updateUserConfig({ theme: { noteColorScheme: target.value } });
  };

  gridSelect?.addEventListener('change', handleGridChange);
  noteSelect?.addEventListener('change', handleNoteChange);

  refreshUI(); // Initial sync

  return {
    detach: () => {
      gridSelect?.removeEventListener('change', handleGridChange);
      noteSelect?.removeEventListener('change', handleNoteChange);
    },
    refreshUI
  };
}
