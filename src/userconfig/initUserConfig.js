// js/userconfig/initUserConfig.js

import { initAISettingsUI } from './settings/aiSettings.js';
import { initSequencerSettings } from './settings/sequencerSettings.js';

export function initConfigModal() {
  const configModal = document.getElementById('userconfig-modal');
  const tabs = document.querySelectorAll('.settings-tab');
  const sections = document.querySelectorAll('.settings-section');

  // UI-tab logic
  function updateTabHighlights() {
    tabs.forEach(tab => {
      const targetId = tab.dataset.tab;
      const section = document.getElementById(targetId);
      const isVisible = section && !section.classList.contains('hidden');

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

      sections.forEach(section => section.classList.add('hidden'));
      const target = document.getElementById(targetId);
      if (target) target.classList.remove('hidden');

      updateTabHighlights();
    });
  });

  updateTabHighlights(); // Initial render
  initAISettingsUI();    // Initialize AI-specific input logic
  initSequencerSettings(); // Initialize sequencer-specific input logic
}
