// src/shared/keybindings/useKeyMacro.ts

import { KeyMacros } from './KeyMacros';
import type { KeyMacroName } from './KeyMacroDefinitions';
import { isShortcutMatch, normalizeKeyCombo } from './ShortcutUtils';

/**
 * Matches a KeyboardEvent against a macro name.
 * Ensures macroName is typed as KeyMacroName.
 */
export function matchesMacro(e: KeyboardEvent, macroName: KeyMacroName): boolean {
  const keyCombos = Array.isArray(KeyMacros[macroName])
    ? KeyMacros[macroName]
    : [KeyMacros[macroName]];

  return keyCombos.some(combo => isShortcutMatch(e, normalizeKeyCombo(combo)));
}
