// src/components/visualizer/visualizerController.ts

import { createVisualizerUI } from '@/components/visualizer/ui/visualizerUI.js';
import { attachVisualizerListeners } from '@/components/visualizer/listeners/visualizerListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Manages the visualizer UI (canvas + side button) and its interaction lifecycle.
 */
export class VisualizerController {
  private container!: HTMLElement;
  private detachFn: (() => void) | null = null;
  private refreshFn: (() => void) | null = null;

  constructor() {
    this.initializeUI();
  }

  private initializeUI(): void {
    this.container = createVisualizerUI();

    const listeners: ListenerAttachment = attachVisualizerListeners(this.container);
    this.detachFn = listeners.detach;
    this.refreshFn = listeners.refreshUI;
  }

  public show(): void {
    this.container.classList.remove('hidden');
    this.refreshFn?.();
  }

  public hide(): void {
    this.container.classList.add('hidden');
  }

  public destroy(): void {
    this.detachFn?.();
    this.container.remove();
  }

  public reload(): void {
    this.destroy();
    this.initializeUI();
  }
}
