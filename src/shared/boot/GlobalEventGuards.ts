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

  // (Optional: disable touch scrolling entirely)
  // window.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  // Optional: override browser shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) {
      e.preventDefault(); // prevent ⌘+S, ⌘+P default browser behavior
    }
  });
}
