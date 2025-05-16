// src/shared/keybindings/KeyMacroStore.test.ts

// npm run test -- src/shared/keybindings/KeyMacroStore.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getKeyMacroBinding,
  updateKeyMacroBinding,
  resetKeyMacros,
  getAllKeyMacroBindings,
  loadUserKeyMacroBindings
} from './KeyMacroStore';

import { DefaultKeyMacros } from './KeyMacroBindings';
import type { KeyMacroName } from './interfaces/KeyMacroDefinitions';
import type { KeyMacroBinding } from './interfaces/KeyMacroBinding';

import * as localStorageUtils from '@/shared/utils/storage/localStorage';

const STORAGE_KEY = 'userKeyMacroBindings';

describe('KeyMacroStore', () => {
  const testMacroName: KeyMacroName = 'ToggleVelocityTool';
  const mockBinding: KeyMacroBinding = { code: 'KeyM', ctrl: true };

  beforeEach(() => {
    resetKeyMacros();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve default bindings', () => {
    const allDefaults = getAllKeyMacroBindings();
    const macroNames = Object.keys(allDefaults) as KeyMacroName[];

    macroNames.forEach(macroName => {
      expect(getKeyMacroBinding(macroName)).toEqual(DefaultKeyMacros[macroName]);
    });
  });

  it('should update a macro binding and persist it', () => {
    const persistSpy = vi.spyOn(localStorageUtils, 'saveJSON');

    updateKeyMacroBinding(testMacroName, mockBinding);

    expect(getKeyMacroBinding(testMacroName)).toEqual(mockBinding);
    expect(persistSpy).toHaveBeenCalledWith(STORAGE_KEY, expect.any(Object));
  });

  it('should reset all macros to defaults and clear user storage', () => {
    const removeSpy = vi.spyOn(localStorageUtils, 'removeItem');

    updateKeyMacroBinding(testMacroName, mockBinding);
    expect(getKeyMacroBinding(testMacroName)).toEqual(mockBinding);

    resetKeyMacros();

    expect(getKeyMacroBinding(testMacroName)).toEqual(DefaultKeyMacros[testMacroName]);
    expect(removeSpy).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('should return the complete current macro bindings', () => {
    const currentBindings = getAllKeyMacroBindings();
    expect(currentBindings).toEqual(DefaultKeyMacros);
  });

  it('should load user-defined bindings from localStorage', () => {
    const userDefinedBinding: KeyMacroBinding = { code: 'KeyU', shift: true };
    const loadedBindings = { ...DefaultKeyMacros, [testMacroName]: userDefinedBinding };

    vi.spyOn(localStorageUtils, 'loadJSON').mockReturnValue(loadedBindings);

    loadUserKeyMacroBindings();

    expect(getKeyMacroBinding(testMacroName)).toEqual(userDefinedBinding);
  });

  it('should skip loading if no user bindings are present', () => {
    const loadSpy = vi.spyOn(localStorageUtils, 'loadJSON').mockReturnValue(undefined);

    loadUserKeyMacroBindings();

    expect(loadSpy).toHaveBeenCalledWith(STORAGE_KEY);
    expect(getAllKeyMacroBindings()).toEqual(DefaultKeyMacros);
  });
});
