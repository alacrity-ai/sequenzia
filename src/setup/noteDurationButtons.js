import { sequencers } from './sequencers.js';
import { GRID_CONFIG as config } from '../sequencer/grid/helpers/constants.js';

export function setupNoteDurationButtons() {
  const buttons = document.querySelectorAll('.note-duration-btn');
  const noteDurationSelect = document.getElementById('note-duration');
  const dottedNoteBtn = document.getElementById('dotted-note-btn');
  const tripletNoteBtn = document.getElementById('triplet-note-btn');
  
  let isDotted = false;
  let isTriplet = false;
  
  function updateNoteDuration(baseValue) {
    // Ensure we're working with numbers
    baseValue = parseFloat(baseValue);
    
    // Calculate modified duration
    let value = baseValue;
    if (isDotted) {
      value = baseValue * 1.5;
    } else if (isTriplet) {
      value = baseValue * (2/3); // Triplet: divide by 3/2
    }
    
    // Find or create matching option
    let option = Array.from(noteDurationSelect.options).find(opt => 
      Math.abs(parseFloat(opt.value) - value) < 0.0001
    );
    
    if (!option) {
      option = new Option(value.toString(), value.toString());
      noteDurationSelect.add(option);
    }
    
    // Set the value
    noteDurationSelect.value = option.value;
    
    // Dispatch change event
    noteDurationSelect.dispatchEvent(new Event('change', {
      bubbles: true,
      cancelable: true
    }));
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active state from all buttons
      buttons.forEach(btn => btn.classList.remove('bg-purple-600'));
      
      // Add active state to clicked button
      button.classList.add('bg-purple-600');
      
      // Get the base value and update
      const baseValue = parseFloat(button.dataset.value);
      updateNoteDuration(baseValue);
    });
  });

  dottedNoteBtn.addEventListener('click', () => {
    // If triplet is on, turn it off
    if (isTriplet) {
      isTriplet = false;
      tripletNoteBtn.classList.remove('bg-purple-600');
    }
    
    isDotted = !isDotted;
    dottedNoteBtn.classList.toggle('bg-purple-600');
    
    updateCurrentDuration();
  });

  tripletNoteBtn.addEventListener('click', () => {
    if (isDotted) {
      isDotted = false;
      dottedNoteBtn.classList.remove('bg-purple-600');
    }
  
    isTriplet = !isTriplet;
    tripletNoteBtn.classList.toggle('bg-purple-600');
  
    // Update global config
    config.isTripletMode = isTriplet;
  
    // 🔁 Update all sequencers with the new triplet mode
    sequencers.forEach(seq => {
      seq.config.isTripletMode = isTriplet;
    });
  
    updateCurrentDuration();
  });

  function updateCurrentDuration() {
    const activeButton = document.querySelector('.note-duration-btn.bg-purple-600');
    if (activeButton) {
      const baseValue = parseFloat(activeButton.dataset.value);
      updateNoteDuration(baseValue);
    }
  }

  // Set initial state by syncing to config.currentDuration
  updateNoteDuration(config.currentDuration || 1);

}





