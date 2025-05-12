// src/components/topControls/components/keyboard/keyboardController.ts

import { createKeyboardUI } from '@/components/topControls/components/keyboard/ui/keyboardUI.js';
import { attachKeyboardMouseListeners } from '@/components/topControls/components/keyboard/listeners/keyboardMouseListeners.js';
import { attachKeyboardKeyListeners } from '@/components/topControls/components/keyboard/listeners/keyboardKeyListeners.js';
import { attachKeyboardSideButtonListeners } from '@/components/topControls/components/keyboard/listeners/sideButtonListeners.js';
import { getKeyboardInstrument, initKeyboardInstrumentState } from '@/components/topControls/components/keyboard/services/keyboardService.js';
import { refreshInstrumentSelectorModal } from '@/components/sequencer/services/instrumentSelectorService.js';

/**
 * Lifecycle manager for the on-screen piano keyboard and its controls.
 * UI is provided via `render()`, and interaction initialized via `initialize()`.
 */
export class KeyboardController {
  private wrapper: HTMLElement;
  private canvas: HTMLCanvasElement;
  private detachFns: (() => void)[] = [];
  private refreshFns: (() => void)[] = [];

  constructor() {
    const { wrapper, canvas } = createKeyboardUI();
    this.wrapper = wrapper;
    this.canvas = canvas;
  }

  /**
   * Returns the wrapper DOM node, but does not insert into the DOM.
   */
  public render(): HTMLElement {
    return this.wrapper;
  }

  /**
   * Attach event listeners. Should be called after the wrapper has been inserted into the DOM.
   */
  public initialize(): void {
    // Load default instrument silently
    initKeyboardInstrumentState();
    const fullName = getKeyboardInstrument()
    refreshInstrumentSelectorModal(fullName);

    // Attach listeners
    const mouse = attachKeyboardMouseListeners(this.canvas);
    const keys = attachKeyboardKeyListeners(this.canvas);
    const side = attachKeyboardSideButtonListeners(this.wrapper);

    // Store for later
    this.detachFns = [mouse.detach, keys.detach, side.detach];
    this.refreshFns = [mouse.refreshUI, keys.refreshUI, side.refreshUI];

    // Ensure keyboard is drawn immediately
    this.refresh();
  }

  public refresh(): void {
    this.refreshFns.forEach(fn => fn());
  }

  public hide(): void {
    this.wrapper.classList.add('hidden');
  }

  public show(): void {
    this.wrapper.classList.remove('hidden');
    this.refresh();
  }

  public destroy(): void {
    this.detachFns.forEach(fn => fn());
    if (this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}
