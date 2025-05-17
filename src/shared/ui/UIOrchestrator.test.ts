// src/shared/ui/UIOrchestrator.test.ts

// npm run test -- src/shared/ui/UIOrchestrator.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIOrchestrator } from './UIOrchestrator';
import { getKeyMacroBinding } from '../keybindings/KeyMacroStore';
import { PopoverEmitter } from './PopoverEmitter';
import type { KeyMacroName } from '../keybindings/interfaces/KeyMacroDefinitions';

// Mock useKeyMacro from @/shared/keybindings/KeyMacroStore
vi.mock('../keybindings/KeyMacroStore.js', () => ({
  getKeyMacroBinding: vi.fn(),
}));

// Mock PopoverEmitter
vi.mock('./PopoverEmitter.js', () => ({
  PopoverEmitter: {
    destroyAll: vi.fn(),
  },
}));

describe('UIOrchestrator', () => {
  let orchestrator: UIOrchestrator;

  beforeEach(() => {
    // Reset singleton state manually
    (UIOrchestrator as any).instance = undefined;
    orchestrator = UIOrchestrator.getInstance();
  });

  it('getInstance always returns the same instance', () => {
    const secondInstance = UIOrchestrator.getInstance();
    expect(secondInstance).toBe(orchestrator);
  });

  it('registerReloadable adds a callback', () => {
    const cb = vi.fn();
    orchestrator.registerReloadable(cb);

    (orchestrator as any).reloadCallbacks.includes(cb); // Check internal state
    expect((orchestrator as any).reloadCallbacks).toContain(cb);
  });

  it('unregisterReloadable removes a callback', () => {
    const cb = vi.fn();
    orchestrator.registerReloadable(cb);
    orchestrator.unregisterReloadable(cb);

    expect((orchestrator as any).reloadCallbacks).not.toContain(cb);
  });

  it('reloadAll calls all registered callbacks', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    orchestrator.registerReloadable(cb1);
    orchestrator.registerReloadable(cb2);

    orchestrator.reloadAll();

    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });

  it('unregistered callbacks are not called by reloadAll', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    orchestrator.registerReloadable(cb1);
    orchestrator.registerReloadable(cb2);
    orchestrator.unregisterReloadable(cb1);

    orchestrator.reloadAll();

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });
});
