import { setupExtendModeControls } from '../aimode/ExtendMode.js';
import { setupExtendModeUI } from '../aimode/ExtendMode.js';
import { getOpenAIKey } from '../userconfig/userConfig.js';
import { toggleZoomControls } from './sequencers.js';

export function setupControlModeSwitch() {
  const noteModeBtn = document.getElementById('note-mode-btn');
  const aiModeBtn = document.getElementById('ai-mode-btn');
  const noteDurationPanel = document.getElementById('note-duration-panel');
  const aiControlPanel = document.getElementById('ai-control-panel');

  function lockSequencerControls() {
    document.querySelectorAll('.sequencer').forEach(sequencer => {
      const deleteBtn = sequencer.querySelector('.delete-btn');
      const collapseBtn = sequencer.querySelector('.collapse-btn');
      const collapseIcon = collapseBtn.querySelector('use');
      
      // Add locked class
      deleteBtn.classList.add('button-locked');
      collapseBtn.classList.add('button-locked');
      
      // Force collapse if not already collapsed
      const body = sequencer.querySelector('.sequencer-body');
      const mini = sequencer.querySelector('.mini-contour');
      toggleZoomControls(sequencer, false);
      if (!body.classList.contains('hidden')) {
        body.classList.add('hidden');
        mini.classList.remove('hidden');
        collapseIcon.setAttribute('href', '#icon-caret-up');
      }
    });
  }

  function unlockSequencerControls() {
    document.querySelectorAll('.sequencer').forEach(sequencer => {
      // Get the buttons we want to unlock
      const deleteBtn = sequencer.querySelector('.delete-btn');
      const collapseBtn = sequencer.querySelector('.collapse-btn');
      
      // Remove locked class
      deleteBtn.classList.remove('button-locked');
      collapseBtn.classList.remove('button-locked');
    });
  }

  function switchToNoteMode() {
    // Update button states
    noteModeBtn.classList.replace('bg-gray-800', 'bg-blue-600');
    aiModeBtn.classList.replace('bg-purple-600', 'bg-gray-800');
    
    // Show/hide panels
    noteDurationPanel.classList.remove('hidden');
    aiControlPanel.classList.add('hidden');

    // Unlock sequencer controls
    unlockSequencerControls();
  }

  function switchToAIMode() {
    // Check if OpenAI API key is set
    if (!getOpenAIKey()) {
      document.getElementById('openai-key-not-set-modal').classList.remove('hidden');
      return;
    }

    // Update button states
    aiModeBtn.classList.replace('bg-gray-800', 'bg-purple-600');
    noteModeBtn.classList.replace('bg-blue-600', 'bg-gray-800');
    
    // Show/hide panels
    noteDurationPanel.classList.add('hidden');
    aiControlPanel.classList.remove('hidden');

    // Lock sequencer controls and collapse all sequencers
    lockSequencerControls();
  }

  // Event listeners
  noteModeBtn.addEventListener('click', switchToNoteMode);
  aiModeBtn.addEventListener('click', switchToAIMode);

  // Modal handling
  const inpaintModal = document.getElementById('ai-inpaint-modal');
  const extendModal = document.getElementById('ai-extend-modal');
  const generateModal = document.getElementById('ai-generate-modal');

  // Helper function to setup modal buttons
  function setupModalCancelButtons(modal) {
    const cancelBtn = modal.querySelector('.cancel-btn');
  
    cancelBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  // Setup all modals
  setupModalCancelButtons(inpaintModal);
  setupModalCancelButtons(extendModal);
  setupModalCancelButtons(generateModal);
  
  // Setup additional controls inside the extend modal
  setupExtendModeControls();

  // Update AI button handlers to show modals
  document.getElementById('ai-inpaint-btn').addEventListener('click', () => {
    inpaintModal.classList.remove('hidden');
  });

  document.getElementById('ai-extend-btn').addEventListener('click', () => {
    extendModal.classList.remove('hidden');
    setupExtendModeUI(); 
    setupExtendModeControls();
  });
  
  document.getElementById('ai-generate-btn').addEventListener('click', () => {
    generateModal.classList.remove('hidden');
  });
}


