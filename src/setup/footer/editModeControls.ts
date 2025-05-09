// src/setup/editModeControls.js

export function setupEditModeControls(): void {
  // Mode buttons
  const notePlacementModeBtn = document.getElementById('note-placement-options-btn') as HTMLElement | null;
  const selectModeBtn = document.getElementById('note-editing-options-btn') as HTMLElement | null;

  // Control panels
  const noteDurationControls = document.getElementById('note-duration-controls') as HTMLElement | null;
  const selectModeControls = document.getElementById('note-editing-controls') as HTMLElement | null;
  const velocityModeControls = document.getElementById('velocity-mode-controls') as HTMLElement | null;

  if (!notePlacementModeBtn || !selectModeBtn || 
      !noteDurationControls || !selectModeControls || !velocityModeControls) {
    console.error("Missing essential UI elements for edit mode switching.");
    return;
  }

  // Helper function to update button states
  function updateButtonStates(activeButton: HTMLElement): void {
    [notePlacementModeBtn, selectModeBtn].forEach(btn => {
      if (!btn) return;
      btn.classList.remove('bg-purple-600');
      btn.classList.add('bg-gray-800');
    });

    activeButton.classList.remove('bg-gray-800');
    activeButton.classList.add('bg-purple-600');
  }

  // Helper function to update control panel visibility
  function updateControlPanels(activePanel: HTMLElement): void {
    [noteDurationControls, selectModeControls, velocityModeControls].forEach(panel => {
      if (!panel) return;
      panel.classList.add('hidden');
    });

    activePanel.classList.remove('hidden');
  }

  // Mode switching behavior
  notePlacementModeBtn.addEventListener('click', () => {
    updateButtonStates(notePlacementModeBtn);
    updateControlPanels(noteDurationControls);
  });

  selectModeBtn.addEventListener('click', () => {
    updateButtonStates(selectModeBtn);
    updateControlPanels(selectModeControls);
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    const modalOpen = document.querySelector('.ai-modal:not(.hidden)') as HTMLElement | null;
    if (modalOpen) return;

    // Mode switching hotkeys
    switch (e.key.toLowerCase()) {
      case 'q':
        notePlacementModeBtn.click();
        break;
      case 'w':
        selectModeBtn.click();
        break;
      default:
        return;
    }
  });

  // Default UI state
  updateButtonStates(notePlacementModeBtn);
  updateControlPanels(noteDurationControls);
  // setEditMode('note-placement');
}
