// src/userSettings/listeners/attachModalListeners.ts
import { UserConfigModal } from '../ui/UserConfigModal.js';

interface ModalListenerOptions {
  onSave?: () => void;
  onClose?: () => void;
}

export function attachModalListeners(modal: UserConfigModal, options: ModalListenerOptions = {}): () => void {
  const tabs = modal.getTabs();
  const sections = modal.getSections();
  const closeBtn = modal.getCloseButton();
  const saveBtn = modal.getSaveButton();

  const handleTabClick = (targetTabId: string) => {
    sections.forEach(section => {
      section.classList.add('hidden');
    });

    const activeSection = document.getElementById(`userconfig-${targetTabId}`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
    }

    tabs.forEach(tab => {
      const isActive = tab.dataset.tab === targetTabId;
      tab.classList.toggle('text-purple-500', isActive);
      tab.classList.toggle('opacity-100', isActive);
      tab.classList.toggle('text-gray-300', !isActive);
      tab.classList.toggle('opacity-50', !isActive);
    });
  };

  const tabHandlers: (() => void)[] = [];

  tabs.forEach(tab => {
    const tabId = tab.dataset.tab;
    if (!tabId) return;

    const clickHandler = () => handleTabClick(tabId);
    tab.addEventListener('click', clickHandler);
    tabHandlers.push(() => tab.removeEventListener('click', clickHandler));
  });

  const closeHandler = () => {
    options.onClose?.();
    modal.hide();
  };

  const saveHandler = () => {
    options.onSave?.();
    modal.hide();
  };

  closeBtn.addEventListener('click', closeHandler);
  saveBtn.addEventListener('click', saveHandler);

  // Initialize tab highlight on mount
  (() => {
    const activeTab = Array.from(tabs).find(tab => tab.classList.contains('text-purple-500'));
    if (activeTab?.dataset.tab) {
      handleTabClick(activeTab.dataset.tab);
    }
  })();

  // Detach
  return () => {
    tabHandlers.forEach(fn => fn());
    closeBtn.removeEventListener('click', closeHandler);
    saveBtn.removeEventListener('click', saveHandler);
  };
}
