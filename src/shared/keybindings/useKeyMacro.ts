// src/shared/keybindings/useKeyMacro.ts

import { getKeyMacroBinding } from '@/shared/keybindings/KeyMacroStore.js';

import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';
import type { KeyMacroBinding } from '@/shared/keybindings/interfaces/KeyMacroBinding.js';

/**
 * Determines if the given KeyboardEvent matches the macro binding.
 */
function isMacroMatch(e: KeyboardEvent, binding: KeyMacroBinding): boolean {
  return (
    e.code === binding.code &&
    (!!e.ctrlKey === !!binding.ctrl) &&
    (!!e.shiftKey === !!binding.shift) &&
    (!!e.altKey === !!binding.alt) &&
    (!!e.metaKey === !!binding.meta)
  );
}

/**
 * Checks if a KeyboardEvent matches the given macroName binding(s).
 */
export function matchesMacro(e: KeyboardEvent, macroName: KeyMacroName): boolean {
  const bindingOrBindings = getKeyMacroBinding(macroName);
  const bindings = Array.isArray(bindingOrBindings) ? bindingOrBindings : [bindingOrBindings];

  for (const binding of bindings) {
    if (isMacroMatch(e, binding)) {
      console.debug('[matchesMacro] Matched macro:', macroName, 'with event:', e, '→ binding:', binding);
      return true;
    }
  }

  return false;
}
