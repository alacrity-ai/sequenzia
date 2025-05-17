// src/components/globalControls/ui/prefabs/hotkeyPopover.ts

import { createMinimalPopover } from '@/shared/ui/primitives/createMinimalPopover.js';
import { getKeyMacroBinding } from '@/shared/keybindings/KeyMacroStore.js';
import { getNormalizedKeyMacroCodeFromBinding } from '@/shared/keybindings/helpers/normalizedKeyMacroCode.js';
import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';
import type { KeyMacroBinding } from '@/shared/keybindings/interfaces/KeyMacroBinding.js';

/**
 * Formats a KeyMacroBinding into a display string like "Ctrl + Shift + A".
 */
function formatKeyMacro(binding: KeyMacroBinding): string {
  const mods = [];
  if (binding.ctrl) mods.push('Ctrl');
  if (binding.shift) mods.push('Shift');
  if (binding.alt) mods.push('Alt');
  if (binding.meta) mods.push('Meta');

  const normalizedCode = getNormalizedKeyMacroCodeFromBinding(binding);
  return [...mods, normalizedCode].join(' + ');
}

/**
 * Creates a hotkey popover for the given trigger and macro.
 */
export function createHotkeyPopover(triggerEl: HTMLElement, macroName: KeyMacroName) {
  const bindingOrBindings = getKeyMacroBinding(macroName);
  const bindings = Array.isArray(bindingOrBindings) ? bindingOrBindings : [bindingOrBindings];

  const contentBody = bindings.map(binding => {
    const formatted = formatKeyMacro(binding);
    return document.createElement('div').appendChild(document.createTextNode(formatted)).parentElement!;
  });

  return createMinimalPopover(triggerEl, contentBody, {
    placement: 'top',
    triggerType: 'hover'
  }, true);
}
