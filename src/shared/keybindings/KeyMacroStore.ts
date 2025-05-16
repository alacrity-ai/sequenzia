// src/shared/keybindings/KeyMacroStore.ts

import { DefaultKeyMacros } from '@/shared/keybindings/KeyMacroBindings.js';
import { saveJSON, loadJSON, removeItem } from '@/shared/utils/storage/localStorage.js';

import type { KeyMacroBinding } from '@/shared/keybindings/interfaces/KeyMacroBinding.js';
import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';

const STORAGE_KEY = 'userKeyMacroBindings';

// Mutable runtime key macro bindings
const currentKeyMacros: Record<KeyMacroName, KeyMacroBinding | KeyMacroBinding[]> = structuredClone(DefaultKeyMacros);

/**
 * Returns the current binding(s) for a macro.
 */
export function getKeyMacroBinding(macroName: KeyMacroName): KeyMacroBinding | KeyMacroBinding[] {
  return currentKeyMacros[macroName];
}

/**
 * Updates the binding(s) for a macro.
 */
export function updateKeyMacroBinding(macroName: KeyMacroName, binding: KeyMacroBinding | KeyMacroBinding[]): void {
  console.debug('[KeyMacroStore] Updated macro:', macroName, '→', binding);
  currentKeyMacros[macroName] = binding;
  persistKeyMacros(); // Auto-save on update
}

/**
 * Resets all bindings to their default state.
 */
export function resetKeyMacros(): void {
  console.debug('[KeyMacroStore] Resetting all macros to defaults.');
  Object.keys(DefaultKeyMacros).forEach(macroName => {
    currentKeyMacros[macroName as KeyMacroName] = structuredClone(DefaultKeyMacros[macroName as KeyMacroName]);
  });
  removeItem(STORAGE_KEY);
}

/**
 * Returns the full current macro map.
 */
export function getAllKeyMacroBindings(): Record<KeyMacroName, KeyMacroBinding | KeyMacroBinding[]> {
  return currentKeyMacros;
}

/**
 * Saves current bindings to localStorage.
 */
function persistKeyMacros(): void {
  saveJSON(STORAGE_KEY, currentKeyMacros);
}

/**
 * Loads bindings from localStorage, overriding defaults.
 */
export function loadUserKeyMacroBindings(): void {
  const loaded = loadJSON<Record<KeyMacroName, KeyMacroBinding | KeyMacroBinding[]>>(STORAGE_KEY);
  if (loaded) {
    console.debug('[KeyMacroStore] Loaded user bindings from localStorage.');
    Object.keys(loaded).forEach(macroName => {
      currentKeyMacros[macroName as KeyMacroName] = loaded[macroName as KeyMacroName];
    });
  }
}
