// src/shared/boot/GlobalEventGuards.ts

/**
 * Registers global event guards to suppress browser default behaviors
 * that interfere with app-specific interactions or cause unexpected UI issues.
 */
export function registerGlobalEventGuards(): void {
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('dragstart', (e) => e.preventDefault());
  window.addEventListener('selectstart', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());
  window.addEventListener('dragover', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    const blockedKeys = [
      ' ',         // space
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

    // Block key if it's one of the above, or a reserved shortcut (like Cmd+S)
    if (
      blockedKeys.includes(e.key) ||
      ((isMacShortcut || isCtrlShortcut) && ['s', 'p'].includes(e.key.toLowerCase()))
    ) {
      e.preventDefault();
    }
  });
}
