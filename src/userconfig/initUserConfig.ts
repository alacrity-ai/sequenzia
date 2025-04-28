import { initAISettingsUI } from './settings/aiSettings.js';
import { initSequencerSettings } from './settings/sequencerSettings.js';

export function initConfigModal(): void {
  const configModal = document.getElementById('userconfig-modal') as HTMLElement | null;
  const tabs = document.querySelectorAll<HTMLElement>('.settings-tab');
  const sections = document.querySelectorAll<HTMLElement>('.settings-section');

  if (!configModal) return;

  // UI-tab logic
  function updateTabHighlights(): void {
    tabs.forEach(tab => {
      const targetId = tab.dataset.tab;
      if (!targetId) return;

      const section = document.getElementById(targetId);
      const isVisible = section !== null && !section.classList.contains('hidden');

      tab.classList.toggle('text-purple-500', isVisible);
      tab.classList.toggle('opacity-100', isVisible);
      tab.classList.toggle('text-gray-500', !isVisible);
      tab.classList.toggle('opacity-50', !isVisible);
    });
  }

  // Tab switching behavior
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      if (!targetId) return;

      sections.forEach(section => section.classList.add('hidden'));

      const target = document.getElementById(targetId);
      if (target) {
        target.classList.remove('hidden');
      }

      updateTabHighlights();
    });
  });

  updateTabHighlights(); // Initial render
  initAISettingsUI();     // Initialize AI-specific input logic
  initSequencerSettings(); // Initialize sequencer-specific input logic
}
