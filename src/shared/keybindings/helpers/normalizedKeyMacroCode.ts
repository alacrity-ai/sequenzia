// src/shared/keybindings/helpers/normalizedKeyMacroCode.ts

import { getKeyMacroBinding } from '@/shared/keybindings/KeyMacroStore.js';
import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';
import type { KeyMacroBinding } from '@/shared/keybindings/interfaces/KeyMacroBinding.js';

/**
 * Normalizes a physical key code into a display-friendly character.
 */
function normalizeBindingCode(code: string): string {
  if (code.startsWith('Key') && code.length === 4) return code[3];
  if (code.startsWith('Digit') && code.length === 6) return code[5];

  const specialMap: Record<string, string> = {
    BracketLeft: '[',
    BracketRight: ']',
    Backquote: '`',
    Minus: '-',
    Equal: '=',
    Semicolon: ';',
    Quote: '\'',
    Comma: ',',
    Period: '.',
    Slash: '/',
    Backslash: '\\',
    Space: 'Space'
  };

  return specialMap[code] ?? code;
}

/**
 * Formats a KeyMacroBinding into a display string with modifiers.
 * E.g., Ctrl+Shift+V
 */
function formatBindingDisplay(binding: KeyMacroBinding): string {
  const mods: string[] = [];

  if (binding.ctrl) mods.push('Ctrl');
  if (binding.shift) mods.push('Shift');
  if (binding.alt) mods.push('Alt');
  if (binding.meta) {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    mods.push(isMac ? 'Cmd' : 'Win');
  }

  const normalizedCode = normalizeBindingCode(binding.code);

  return [...mods, normalizedCode].join('+');
}

/**
 * Returns a normalized display string for a specific KeyMacroBinding.
 * Includes modifiers like Ctrl, Shift, Alt, Cmd/Win.
 * E.g., Ctrl+V, Shift+1, Alt+[, etc.
 */
export function getNormalizedKeyMacroCodeFromBinding(binding: KeyMacroBinding): string {
  if (!binding) return '';

  const mods: string[] = [];

  if (binding.ctrl) mods.push('Ctrl');
  if (binding.shift) mods.push('Shift');
  if (binding.alt) mods.push('Alt');
  if (binding.meta) {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    mods.push(isMac ? 'Cmd' : 'Win');
  }

  const normalizedCode = normalizeBindingCode(binding.code);

  return [...mods, normalizedCode].join('+');
}

/**
 * Returns the formatted key macro binding display string.
 * Always uses the first binding if multiple are defined.
 */
export function getNormalizedKeyMacroCode(macroName: KeyMacroName): string {
  const bindingOrBindings = getKeyMacroBinding(macroName);
  const binding = Array.isArray(bindingOrBindings) ? bindingOrBindings[0] : bindingOrBindings;

  if (!binding) return '';

  return formatBindingDisplay(binding);
}
