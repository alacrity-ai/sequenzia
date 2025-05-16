// src/shared/keybindings/useKeyMacro.test.ts

// npm run test -- src/shared/keybindings/useKeyMacro.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchesMacro } from '@/shared/keybindings/useKeyMacro.js';

import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';
import type { KeyMacroBinding } from '@/shared/keybindings/interfaces/KeyMacroBinding.js';

import * as KeyMacroStore from './KeyMacroStore';

describe('useKeyMacro', () => {
  const macroName: KeyMacroName = 'ToggleVelocityTool';

  const baseEvent = {
    code: 'KeyV',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
  } as KeyboardEvent;

  const ctrlBinding: KeyMacroBinding = { code: 'KeyV', ctrl: true };
  const shiftBinding: KeyMacroBinding = { code: 'KeyV', shift: true };
  const metaBinding: KeyMacroBinding = { code: 'KeyV', meta: true };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should match a single binding correctly', () => {
    vi.spyOn(KeyMacroStore, 'getKeyMacroBinding').mockReturnValue(ctrlBinding);

    const event = { ...baseEvent, ctrlKey: true };
    expect(matchesMacro(event, macroName)).toBe(true);
  });

  it('should return false if binding does not match', () => {
    vi.spyOn(KeyMacroStore, 'getKeyMacroBinding').mockReturnValue(ctrlBinding);

    const event = { ...baseEvent, shiftKey: true };
    expect(matchesMacro(event, macroName)).toBe(false);
  });

  it('should match first binding in array', () => {
    vi.spyOn(KeyMacroStore, 'getKeyMacroBinding').mockReturnValue([ctrlBinding, shiftBinding]);

    const event = { ...baseEvent, ctrlKey: true };
    expect(matchesMacro(event, macroName)).toBe(true);
  });

  it('should match second binding in array', () => {
    vi.spyOn(KeyMacroStore, 'getKeyMacroBinding').mockReturnValue([ctrlBinding, shiftBinding]);

    const event = { ...baseEvent, shiftKey: true };
    expect(matchesMacro(event, macroName)).toBe(true);
  });

  it('should return false if no bindings match', () => {
    vi.spyOn(KeyMacroStore, 'getKeyMacroBinding').mockReturnValue([ctrlBinding, shiftBinding]);

    const event = { ...baseEvent, altKey: true };
    expect(matchesMacro(event, macroName)).toBe(false);
  });

  it('should handle undefined modifier flags correctly', () => {
    const noModifiersBinding: KeyMacroBinding = { code: 'KeyV' };
    vi.spyOn(KeyMacroStore, 'getKeyMacroBinding').mockReturnValue(noModifiersBinding);

    expect(matchesMacro(baseEvent, macroName)).toBe(true);
  });

  it('should distinguish between ctrl and meta on Mac', () => {
    vi.spyOn(KeyMacroStore, 'getKeyMacroBinding').mockReturnValue(metaBinding);

    const event = { ...baseEvent, ctrlKey: true };
    expect(matchesMacro(event, macroName)).toBe(false);

    const metaEvent = { ...baseEvent, metaKey: true };
    expect(matchesMacro(metaEvent, macroName)).toBe(true);
  });
});
