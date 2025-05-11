// src/shared/ui/helpers/setSideButtonActivated.ts

/**
 * Replaces the current style class of a side button with its activated or default class.
 */
export function setSideButtonActivated(btn: HTMLElement, active: boolean): void {
  if (active) {
    btn.classList.remove('side-button-secondary', 'side-button-primary');
    btn.classList.add('side-button-activated');
  } else {
    btn.classList.remove('side-button-activated');
    // You could make this conditional if needed (primary vs secondary)
    btn.classList.add('side-button-secondary');
  }
}
