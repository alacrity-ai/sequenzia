// src/setup/noteDurationButtons.js

import { sequencers } from './sequencers.js';
import { GRID_CONFIG as config } from '../sequencer/grid/helpers/constants.js';

export function setupNoteDurationButtons(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.note-duration-btn');
  const noteDurationSelect = document.getElementById('note-duration') as HTMLSelectElement;
  const dottedNoteBtn = document.getElementById('dotted-note-btn') as HTMLButtonElement;
  const tripletNoteBtn = document.getElementById('triplet-note-btn') as HTMLButtonElement;
  
  let isDotted = false;
  let isTriplet = false;
  
  function updateNoteDuration(baseValue: number): void {
    let value = baseValue;

    if (isDotted) {
      value = baseValue * 1.5;
    } else if (isTriplet) {
      value = baseValue * (2 / 3); // Triplet adjustment
    }

    // Find or create matching option
    let option = Array.from(noteDurationSelect.options).find(opt =>
      Math.abs(parseFloat(opt.value) - value) < 0.0001
    );

    if (!option) {
      option = new Option(value.toString(), value.toString());
      noteDurationSelect.add(option);
    }

    // Set and dispatch
    noteDurationSelect.value = option.value;
    noteDurationSelect.dispatchEvent(new Event('change', {
      bubbles: true,
      cancelable: true
    }));
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active state
      buttons.forEach(btn => btn.classList.remove('bg-purple-600'));

      // Add active state to clicked button
      button.classList.add('bg-purple-600');

      const baseValue = parseFloat(button.dataset.value!);
      updateNoteDuration(baseValue);
    });
  });

  dottedNoteBtn.addEventListener('click', () => {
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

    // 🔁 Update all sequencers' configs
    sequencers.forEach(seq => {
      seq.config.isTripletMode = isTriplet;
    });

    updateCurrentDuration();
  });

  function updateCurrentDuration(): void {
    const activeButton = document.querySelector<HTMLButtonElement>('.note-duration-btn.bg-purple-600');
    if (activeButton) {
      const baseValue = parseFloat(activeButton.dataset.value!);
      updateNoteDuration(baseValue);
    }
  }

  // Set initial state
  updateNoteDuration(config.currentDuration || 1);
}
