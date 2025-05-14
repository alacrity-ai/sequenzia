import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';

let autocompleteToggleBtn: HTMLButtonElement | null = null;

export function isButtonDisabled(): boolean {
  return autocompleteToggleBtn?.disabled ?? false;
}

export function setAutocompleteToggleButton(el: HTMLButtonElement): void {
  autocompleteToggleBtn = el;
}

export function disableAutocompleteToggle(): void {
  if (autocompleteToggleBtn) {
    autocompleteToggleBtn.disabled = true;
    autocompleteToggleBtn.classList.add('opacity-50', 'cursor-not-allowed');
    showAutocompleteLoadingState();
  }
}

export function enableAutocompleteToggle(): void {
  if (autocompleteToggleBtn) {
    autocompleteToggleBtn.disabled = false;
    autocompleteToggleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    resetAutocompleteButtonState();
  }
}

export function showAutocompleteLoadingState(): void {
  if (!autocompleteToggleBtn) return;

  const img = autocompleteToggleBtn.querySelector('img');
  if (img) {
    img.src = getAssetPath('static/svg/icon-cog.svg');
    img.classList.add('img-spin');
    img.alt = 'Generating...';
  }
}

export function resetAutocompleteButtonState(): void {
  if (!autocompleteToggleBtn) return;

  const img = autocompleteToggleBtn.querySelector('img');
  if (img) {
    img.src = getAssetPath('static/svg/icon-cursor-arrow-rays.svg');
    img.classList.remove('img-spin');
    img.alt = 'Toggle Autocomplete';
  }
}
