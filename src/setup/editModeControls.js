import { setEditMode, EditModes } from './editModeStore.js';

export function setupEditModeControls() {
  // Mode buttons
  const notePlacementModeBtn = document.getElementById('note-placement-mode-btn');
  const selectModeBtn = document.getElementById('select-mode-btn');
  const velocityModeBtn = document.getElementById('velocity-mode-btn');

  // Control panels
  const noteDurationControls = document.getElementById('note-duration-controls');
  const selectModeControls = document.getElementById('select-mode-controls');
  const velocityModeControls = document.getElementById('velocity-mode-controls');

  // Helper function to update button states
  function updateButtonStates(activeButton) {
    [notePlacementModeBtn, selectModeBtn, velocityModeBtn].forEach(btn => {
      btn.classList.remove('bg-purple-600');
      btn.classList.add('bg-gray-800');
    });

    activeButton.classList.remove('bg-gray-800');
    activeButton.classList.add('bg-purple-600');
  }

  // Helper function to update control panel visibility
  function updateControlPanels(activePanel) {
    [noteDurationControls, selectModeControls, velocityModeControls].forEach(panel => {
      panel.classList.add('hidden');
    });

    activePanel.classList.remove('hidden');
  }

  // Mode switching behavior
  notePlacementModeBtn.addEventListener('click', () => {
    updateButtonStates(notePlacementModeBtn);
    updateControlPanels(noteDurationControls);
    setEditMode('note-placement');
  });

  selectModeBtn.addEventListener('click', () => {
    updateButtonStates(selectModeBtn);
    updateControlPanels(selectModeControls);
    setEditMode('select');
  });

  velocityModeBtn.addEventListener('click', () => {
    updateButtonStates(velocityModeBtn);
    updateControlPanels(velocityModeControls);
    setEditMode('velocity');
  });

  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  
    const modalOpen = document.querySelector('.ai-modal:not(.hidden)');
    if (modalOpen) return;
  
    // Mode switching hotkeys
    switch (e.key) {
      case 'q':
        notePlacementModeBtn.click();
        break;
      case 'w':
        selectModeBtn.click();
        break;
      case 'e':
        velocityModeBtn.click();
        break;
      default:
        return;
    }    
  });

  // Default UI state
  updateButtonStates(notePlacementModeBtn);
  updateControlPanels(noteDurationControls);
  setEditMode('note-placement');
}
