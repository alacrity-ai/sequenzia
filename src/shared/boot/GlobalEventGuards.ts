// src/shared/boot/GlobalEventGuards.ts

/**
 * Registers global event guards to suppress browser default behaviors
 * that interfere with app-specific interactions or cause unexpected UI issues.
 */
export function registerGlobalEventGuards(): void {
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement;

    if (
      target.closest('.copy-midi-btn') || // Allow per-track MIDI drag
      target.closest('.drag-midi-btn')    // Allow full-song MIDI drag
    ) return;

    e.preventDefault(); // Block all other drags
  });

  window.addEventListener('selectstart', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());
  window.addEventListener('dragover', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    const blockedKeys = [
      ' ', // space
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ];

    const isMacShortcut = e.metaKey;
    const isCtrlShortcut = e.ctrlKey;

    if (
      blockedKeys.includes(e.key) ||
      ((isMacShortcut || isCtrlShortcut) && ['s', 'p'].includes(e.key.toLowerCase()))
    ) {
      e.preventDefault();
    }
  });
}
