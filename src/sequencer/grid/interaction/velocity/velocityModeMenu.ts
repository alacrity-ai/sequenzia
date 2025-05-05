// // src/sequencer/grid/interaction/velocity/velocityModeMenu.ts

// import type { Note } from '../../../interfaces/Note.js';
// import { applyVelocityChange } from './velocityService.js';

// let currentNotes: Note[] = [];

// const modalId = 'velocity-modal';
// const actionSelectId = 'velocity-action-select';
// const valueInputId = 'velocity-value-input';
// const applyBtnId = 'velocity-apply-btn';
// const cancelBtnId = 'velocity-cancel-btn';

// function getModalElement(): HTMLElement {
//   const el = document.getElementById(modalId);
//   if (!el) throw new Error(`[VelocityModeMenu] Modal element "#${modalId}" not found`);
//   return el;
// }

// export function showVelocityModal(notes: Note[]): void {
//   currentNotes = notes;
//   getModalElement().classList.remove('hidden');
// }

// function hideVelocityModal(): void {
//   getModalElement().classList.add('hidden');
//   currentNotes = [];
// }

// function onApply(): void {
//   const setEnabled = (document.getElementById('velocity-set-toggle') as HTMLInputElement)?.checked ?? true;
//   const rampEnabled = (document.getElementById('velocity-ramp-toggle') as HTMLInputElement)?.checked ?? false;
//   const randomize = (document.getElementById('velocity-randomize-toggle') as HTMLInputElement)?.checked ?? false;

//   const rawValue = parseInt((document.getElementById(valueInputId) as HTMLInputElement)?.value ?? '', 10);
//   const baseValue = isNaN(rawValue) ? 100 : rawValue;
//   const clampedBase = Math.max(1, Math.min(127, baseValue));
  

//   const action = setEnabled
//     ? (document.getElementById(actionSelectId) as HTMLSelectElement)?.value as 'set' | 'increase' | 'decrease'
//     : 'none';

//   // Ramp values (only if enabled)
//   const rampDir = rampEnabled
//     ? (document.getElementById('velocity-ramp-direction') as HTMLSelectElement)?.value as 'up' | 'down'
//     : 'none';

//   const rampAmt = rampEnabled
//     ? parseInt((document.getElementById('velocity-ramp-amount') as HTMLInputElement)?.value ?? '0', 10)
//     : 0;

//   const rampMode = rampEnabled
//     ? (document.querySelector('input[name="ramp-mode"]:checked') as HTMLInputElement)?.value as 'linear' | 'exponential'
//     : 'linear';

//   // Randomization
//   const randomRange = randomize
//     ? parseInt((document.getElementById('velocity-random-range') as HTMLInputElement)?.value ?? '0', 10)
//     : 0;

//   applyVelocityChange(currentNotes, {
//     mode: action,
//     value: clampedBase,
//     rampDirection: rampDir,
//     rampAmount: rampAmt,
//     rampMode,
//     randomize,
//     randomRange,
//   });

//   hideVelocityModal();
// }

// function onCancel(): void {
//   hideVelocityModal();
// }

// function setupVelocityToggleHandlers(): void {
//   const setToggle = document.getElementById('velocity-set-toggle') as HTMLInputElement;
//   const setFields = document.getElementById('velocity-set-fields') as HTMLElement;

//   const rampToggle = document.getElementById('velocity-ramp-toggle') as HTMLInputElement;
//   const rampFields = document.getElementById('velocity-ramp-fields') as HTMLElement;

//   const randomToggle = document.getElementById('velocity-randomize-toggle') as HTMLInputElement;
//   const randomFields = document.getElementById('velocity-random-fields') as HTMLElement;


//   if (setToggle && setFields) {
//     setToggle.addEventListener('change', () => {
//       setFields.classList.toggle('opacity-50', !setToggle.checked);
//       setFields.classList.toggle('pointer-events-none', !setToggle.checked);
//     });
//   }

//   if (rampToggle && rampFields) {
//     rampToggle.checked = false;
//     rampFields.classList.add('opacity-50', 'pointer-events-none');

//     rampToggle.addEventListener('change', () => {
//       rampFields.classList.toggle('opacity-50', !rampToggle.checked);
//       rampFields.classList.toggle('pointer-events-none', !rampToggle.checked);
//     });
//   }

//   if (randomToggle && randomFields) {
//     const update = () => {
//       const enabled = randomToggle.checked;
//       randomFields.classList.toggle('opacity-50', !enabled);
//       randomFields.classList.toggle('pointer-events-none', !enabled);
//     };
//     randomToggle.addEventListener('change', update);
//     update(); // initialize on load
//   }
// }

// export function registerVelocityMenuHandlers(): void {
//   document.getElementById(applyBtnId)?.addEventListener('click', onApply);
//   document.getElementById(cancelBtnId)?.addEventListener('click', onCancel);
//   setupVelocityToggleHandlers();
// }
