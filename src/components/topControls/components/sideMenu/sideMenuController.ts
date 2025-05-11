// src/components/sideMenu/sideMenuController.ts

import { createSideMenuUI } from './ui/sideMenuUI.js';
import { attachSideMenuListeners } from './listeners/sideMenuListeners.js';
import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';

/**
 * Lifecycle controller for left-side tool buttons (Piano, Mixer, AI).
 */
export class SideMenuController {
  private container!: HTMLElement;
  private detachFn: (() => void) | null = null;
  private refreshFn: (() => void) | null = null;

  constructor() {
    this.initializeUI();
  }

  private initializeUI(): void {
    this.container = createSideMenuUI();
    const listeners: ListenerAttachment = attachSideMenuListeners(this.container);
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
