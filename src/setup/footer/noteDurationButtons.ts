import { sequencers } from '../../sequencer/factories/SequencerFactory.js';
import { SEQUENCER_CONFIG as config } from '../../sequencer/constants/sequencerConstants.js';
import { isKeyboardListenersAttached } from '../../keyboard/input/keyboard-interaction.js';

const durationHotkeys: Record<string, number> = {
  Digit1: 4,
  Digit2: 2,
  Digit3: 1,
  Digit4: 0.5,
  Digit5: 0.25,
  Digit6: 0.125,
};

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
      value = baseValue * (2 / 3);
    }
  
    // Update global config
    config.currentDuration = value;
  
    // Update each sequencer's config
    sequencers.forEach(seq => {
      seq.config.currentDuration = value;
      seq.matrix?.requestRedraw();
    });
  
    // Update the UI <select> value
    let option = Array.from(noteDurationSelect.options).find(opt =>
      Math.abs(parseFloat(opt.value) - value) < 0.0001
    );
  
    if (!option) {
      option = new Option(value.toString(), value.toString());
      noteDurationSelect.add(option);
    }
  
    noteDurationSelect.value = option.value;
    noteDurationSelect.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  
    highlightActiveDuration(baseValue);
  }
  

  function highlightActiveDuration(duration: number): void {
    buttons.forEach(btn => {
      const btnVal = parseFloat(btn.dataset.value ?? '0');
      btn.classList.remove('bg-purple-700', 'bg-gray-800');

      if (btnVal === duration) {
        btn.classList.add('bg-purple-700');
      } else {
        btn.classList.add('bg-gray-800');
      }
    });
  }

  function updateCurrentDuration(): void {
    const activeButton = document.querySelector<HTMLButtonElement>('.note-duration-btn.bg-purple-700');
    if (activeButton) {
      const baseValue = parseFloat(activeButton.dataset.value!);
      updateNoteDuration(baseValue);
    }
  }

  // === Button Clicks ===
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const baseValue = parseFloat(button.dataset.value!);
      updateNoteDuration(baseValue);
    });
  });

  dottedNoteBtn.addEventListener('click', () => {
    if (isTriplet) {
      isTriplet = false;
      tripletNoteBtn.classList.remove('bg-purple-700');
    }

    isDotted = !isDotted;
    dottedNoteBtn.classList.toggle('bg-purple-700');

    updateCurrentDuration();
  });

  tripletNoteBtn.addEventListener('click', () => {
    if (isDotted) {
      isDotted = false;
      dottedNoteBtn.classList.remove('bg-purple-700');
    }

    isTriplet = !isTriplet;
    tripletNoteBtn.classList.toggle('bg-purple-700');

    config.isTripletMode = isTriplet;
    sequencers.forEach(seq => {
      seq.config.isTripletMode = isTriplet;
    });

    updateCurrentDuration();
  });

  // === Keyboard Hotkeys ===
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;

    // Guard: if focus is in an editable field, do nothing
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      isKeyboardListenersAttached()
    ) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(durationHotkeys, e.code)) {
      e.preventDefault();
      const baseValue = durationHotkeys[e.code];
      const targetButton = Array.from(buttons).find(btn =>
        parseFloat(btn.dataset.value ?? '-1') === baseValue
      );
      if (targetButton) targetButton.click();
      return;
    }

    if (e.key === '.') {
      e.preventDefault();
      dottedNoteBtn?.click();
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      tripletNoteBtn?.click();
      return;
    }
  });

  // === Initial State ===
  updateNoteDuration(config.currentDuration || 1);
}
