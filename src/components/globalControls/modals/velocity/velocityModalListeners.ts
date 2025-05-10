// src/components/globalControls/modals/velocity/velocityModalListeners.ts

import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { Note } from '@/shared/interfaces/Note.js';
import { applyVelocityChange } from '@/components/globalControls/modals/velocity/velocityService.js';

let currentNotes: Note[] = [];

export function showVelocityModal(notes: Note[]): void {
  currentNotes = notes;
  const modal = document.getElementById('velocity-modal');
  if (modal) modal.classList.remove('hidden');
}

function hideVelocityModal(): void {
  console.log('CLICKED A BUTTON'); // Not seeing this message
  const modal = document.getElementById('velocity-modal');
  if (modal) modal.classList.add('hidden');
  currentNotes = [];
}

export function attachVelocityModalListeners(modal: HTMLElement): ListenerAttachment {
  const applyBtn = modal.querySelector('#velocity-apply-btn') as HTMLButtonElement | null;
  const cancelBtn = modal.querySelector('#velocity-cancel-btn') as HTMLButtonElement | null;

  const setToggle = modal.querySelector('#velocity-set-toggle') as HTMLInputElement | null;
  const setFields = modal.querySelector('#velocity-action-select')?.parentElement ?? null;

  const rampToggle = modal.querySelector('#velocity-ramp-toggle') as HTMLInputElement | null;
  const rampFields = modal.querySelector('#velocity-ramp-fields') as HTMLElement | null;

  const randomToggle = modal.querySelector('#velocity-randomize-toggle') as HTMLInputElement | null;
  const randomFields = modal.querySelector('#velocity-random-fields') as HTMLElement | null;

  function updateToggleVisibility(toggle: HTMLInputElement | null, target: HTMLElement | null): void {
    if (!toggle || !target) return;
    const enabled = toggle.checked;
    target.classList.toggle('opacity-50', !enabled);
    target.classList.toggle('pointer-events-none', !enabled);
  }

  function initializeToggleHandlers(): void {
    setToggle?.addEventListener('change', () => updateToggleVisibility(setToggle, setFields));
    rampToggle?.addEventListener('change', () => updateToggleVisibility(rampToggle, rampFields));
    randomToggle?.addEventListener('change', () => updateToggleVisibility(randomToggle, randomFields));

    updateToggleVisibility(setToggle, setFields);
    updateToggleVisibility(rampToggle, rampFields);
    updateToggleVisibility(randomToggle, randomFields);
  }

  function handleApply(): void {
    const setEnabled = setToggle?.checked ?? true;
    const rampEnabled = rampToggle?.checked ?? false;
    const randomize = randomToggle?.checked ?? false;

    const action = setEnabled
      ? (modal.querySelector('#velocity-action-select') as HTMLSelectElement)?.value as 'set' | 'increase' | 'decrease'
      : 'none';

    const baseValue = parseInt((modal.querySelector('#velocity-value-input') as HTMLInputElement)?.value ?? '', 10);
    const clampedValue = isNaN(baseValue) ? 100 : Math.max(1, Math.min(127, baseValue));

    const rampDirection = rampEnabled
      ? (modal.querySelector('#velocity-ramp-direction') as HTMLSelectElement)?.value as 'up' | 'down'
      : 'none';

    const rampAmount = rampEnabled
      ? parseInt((modal.querySelector('#velocity-ramp-amount') as HTMLInputElement)?.value ?? '0', 10)
      : 0;

    const rampMode = rampEnabled
      ? (modal.querySelector('input[name="ramp-mode"]:checked') as HTMLInputElement)?.value as 'linear' | 'exponential'
      : 'linear';

    const randomRange = randomize
      ? parseInt((modal.querySelector('#velocity-random-range') as HTMLInputElement)?.value ?? '0', 10)
      : 0;

    applyVelocityChange({
      mode: action,
      value: clampedValue,
      rampDirection,
      rampAmount,
      rampMode,
      randomize,
      randomRange
    });

    hideVelocityModal();
  }

  const detach = (): void => {
    cancelBtn?.removeEventListener('click', hideVelocityModal);
    applyBtn?.removeEventListener('click', handleApply);

    setToggle?.removeEventListener('change', () => updateToggleVisibility(setToggle, setFields));
    rampToggle?.removeEventListener('change', () => updateToggleVisibility(rampToggle, rampFields));
    randomToggle?.removeEventListener('change', () => updateToggleVisibility(randomToggle, randomFields));
  };

  cancelBtn?.addEventListener('click', hideVelocityModal);
  applyBtn?.addEventListener('click', handleApply);

  initializeToggleHandlers();

  return {
    detach,
    refreshUI: () => {}
  };
}
