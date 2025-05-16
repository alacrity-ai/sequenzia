import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { KeyBindingsSectionController } from '../ui/sections/KeyBindingsSection.js';
import type { KeyMacroName } from '@/shared/keybindings/KeyMacroDefinitions.js';

import { updateKeyMacroBinding, resetKeyMacros } from '@/shared/keybindings/KeyMacroStore.js';

/**
 * Attaches rebind listeners to keybinding section UI.
 */
export function attachKeyBindingsListeners(section: KeyBindingsSectionController): ListenerAttachment {
  let isRebinding = false;
  let rebindingMacro: KeyMacroName | null = null;

  const refreshUI = () => {
    section.refreshToggle();
  };

  const enterRebindingMode = (macroName: KeyMacroName, labelEl: HTMLElement) => {
    if (isRebinding) return;
    isRebinding = true;
    rebindingMacro = macroName;

    labelEl.textContent = 'Press Key...';

    const handleKeydown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // === Ignore standalone modifier keys ===
      const ignoredCodes = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'];
      if (ignoredCodes.includes(e.code)) {
        // Allow modifiers to be held, but not bound directly
        return;
      }

      if (e.code === 'Escape') {
        // Cancel rebinding
        section.refreshToggle();
        cleanup();
        return;
      }

      const binding = buildBindingFromEvent(e);

      updateKeyMacroBinding(macroName, binding);
      section.refreshToggle();
      cleanup();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!section.element.contains(e.target as Node)) {
        section.refreshToggle();
        cleanup();
      }
    };

    const cleanup = () => {
      window.removeEventListener('keydown', handleKeydown, true);
      window.removeEventListener('click', handleClickOutside, true);
      isRebinding = false;
      rebindingMacro = null;
    };

    window.addEventListener('keydown', handleKeydown, true);
    window.addEventListener('click', handleClickOutside, true);
  };

  const buildBindingFromEvent = (e: KeyboardEvent) => {
    return {
      code: e.code,
      ctrl: e.ctrlKey || undefined,
      shift: e.shiftKey || undefined,
      alt: e.altKey || undefined,
      meta: e.metaKey || undefined,
    };
  };

  // Attach listeners to each Rebind button
  for (const { macroName, labelEl, buttonEl } of section.bindings) {
    buttonEl.addEventListener('click', () => {
      enterRebindingMode(macroName, labelEl);
    });
  }

  // === Add Reset Button Listener ===
  const resetBtn = section.element.querySelector<HTMLButtonElement>('#keybindings-reset-btn');
  const handleResetClick = () => {
    resetKeyMacros();
    refreshUI();
  };
  resetBtn?.addEventListener('click', handleResetClick);

  return {
    detach: () => {
      for (const { buttonEl } of section.bindings) {
        buttonEl.replaceWith(buttonEl.cloneNode(true)); // Quick detach pattern
      }
      resetBtn?.removeEventListener('click', handleResetClick);
    },
    refreshUI
  };
}
