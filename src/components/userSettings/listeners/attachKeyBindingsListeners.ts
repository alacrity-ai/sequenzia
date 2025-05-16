import { KeyMacros, updateKeyMacroBinding } from '@/shared/keybindings/KeyMacros.js';
import { buildKeyComboFromEvent } from '@/shared/keybindings/ShortcutUtils.js'; // Utility to build combo from KeyboardEvent
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import type { KeyBindingsSectionController } from '../ui/sections/KeyBindingsSection.js';
import type { KeyMacroName } from '@/shared/keybindings/KeyMacroDefinitions.js';

export function attachKeyBindingsListeners(section: KeyBindingsSectionController): ListenerAttachment {
  let isRebinding = false;
  let rebindingMacro: string | null = null;

  const refreshUI = () => {
    section.refreshToggle();
  };

  const enterRebindingMode = (macroName: string, labelEl: HTMLElement) => {
    if (isRebinding) return;
    isRebinding = true;
    rebindingMacro = macroName;

    labelEl.textContent = 'Press Key...';

    const handleKeydown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        // Cancel rebinding
        section.refreshToggle();
        cleanup();
        return;
      }

      const combo = buildKeyComboFromEvent(e);

      updateKeyMacroBinding(macroName as KeyMacroName, combo);
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

  // Attach listeners to each Rebind button
  for (const { macroName, labelEl, buttonEl } of section.bindings) {
    buttonEl.addEventListener('click', () => {
      enterRebindingMode(macroName, labelEl);
    });
  }

  return {
    detach: () => {
      for (const { buttonEl } of section.bindings) {
        buttonEl.replaceWith(buttonEl.cloneNode(true)); // Quick detach pattern
      }
    },
    refreshUI
  };
}
