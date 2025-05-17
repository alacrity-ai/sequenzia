// src/shared/keybindings/helpers/normalizedKeyMacroCode.test.ts

// npm run test -- src/shared/keybindings/helpers/normalizedKeyMacroCode.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNormalizedKeyMacroCode,
  getNormalizedKeyMacroCodeFromBinding
} from './normalizedKeyMacroCode';

import { getKeyMacroBinding } from '@/shared/keybindings/KeyMacroStore.js';
import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';
import type { KeyMacroBinding } from '@/shared/keybindings/interfaces/KeyMacroBinding.js';
import type { Mock } from 'vitest';

// --- Mock getKeyMacroBinding ---
vi.mock('@/shared/keybindings/KeyMacroStore.js', () => ({
  getKeyMacroBinding: vi.fn()
}));

describe('normalizedKeyMacroCode helpers', () => {
  describe('getNormalizedKeyMacroCodeFromBinding', () => {
    it('handles simple keys without modifiers', () => {
      const binding: KeyMacroBinding = { code: 'KeyA' };
      expect(getNormalizedKeyMacroCodeFromBinding(binding)).toBe('A');
    });

    it('handles Digit keys', () => {
      const binding: KeyMacroBinding = { code: 'Digit5' };
      expect(getNormalizedKeyMacroCodeFromBinding(binding)).toBe('5');
    });

    it('handles special mapped codes', () => {
      const binding: KeyMacroBinding = { code: 'BracketLeft' };
      expect(getNormalizedKeyMacroCodeFromBinding(binding)).toBe('[');
    });

    it('includes Ctrl/Shift/Alt modifiers', () => {
      const binding: KeyMacroBinding = { code: 'KeyX', ctrl: true, shift: true, alt: true };
      expect(getNormalizedKeyMacroCodeFromBinding(binding)).toBe('Ctrl+Shift+Alt+X');
    });

    it('returns empty string for null binding', () => {
      expect(getNormalizedKeyMacroCodeFromBinding(null as unknown as KeyMacroBinding)).toBe('');
    });

    it('returns code as-is for unknown codes', () => {
      const binding: KeyMacroBinding = { code: 'WeirdCode' };
      expect(getNormalizedKeyMacroCodeFromBinding(binding)).toBe('WeirdCode');
    });
  });

  describe('getNormalizedKeyMacroCode (macroName lookup)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns formatted binding for macro', () => {
      const mockBinding: KeyMacroBinding = { code: 'KeyC', ctrl: true };
      (getKeyMacroBinding as Mock).mockReturnValue(mockBinding);

      expect(getNormalizedKeyMacroCode('CopyNotes' as KeyMacroName)).toBe('Ctrl+C');
      expect(getKeyMacroBinding).toHaveBeenCalledWith('CopyNotes');
    });

    it('returns first binding if multiple are defined', () => {
      const mockBindings: KeyMacroBinding[] = [
        { code: 'KeyV', ctrl: true },
        { code: 'KeyV', meta: true }
      ];
      (getKeyMacroBinding as Mock).mockReturnValue(mockBindings);

      expect(getNormalizedKeyMacroCode('PasteNotes' as KeyMacroName)).toBe('Ctrl+V');
    });

    it('returns empty string if binding is null', () => {
      (getKeyMacroBinding as Mock).mockReturnValue(undefined);

      expect(getNormalizedKeyMacroCode('Nonexistent' as KeyMacroName)).toBe('');
    });
  });
});
