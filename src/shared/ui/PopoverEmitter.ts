// src/shared/ui/PopoverEmitter.ts

import { Popover } from 'flowbite';
import { matchesMacro } from '../keybindings/useKeyMacro';

type Subscriber = { instance: Popover; contentEl: HTMLElement };

export class PopoverEmitter {
  private static subscribers = new Set<Subscriber>();
  private static altKeyDown = false;
  private static listenersInitialized = false;

  public static subscribe(instance: Popover, contentEl: HTMLElement): void {
    this.subscribers.add({ instance, contentEl });
    this.initGlobalListeners();
  }

  public static unsubscribe(instance: Popover): void {
    this.subscribers.forEach(subscriber => {
      if (subscriber.instance === instance) {
        this.subscribers.delete(subscriber);
      }
    });
  }

  public static getSubscribers(): Set<Subscriber> {
    return this.subscribers;
  }

  public static showAll(): void {
    this.subscribers.forEach(subscriber => subscriber.instance.show());
  }

  public static hideAll(): void {
    this.subscribers.forEach(subscriber => subscriber.instance.hide());
  }

  public static toggleAll(): void {
    this.subscribers.forEach(subscriber => subscriber.instance.toggle());
  }

  public static clear(): void {
    this.subscribers.clear();
  }

  public static destroyAll(): void {
    this.subscribers.forEach(subscriber => {
      subscriber.instance.hide();
      if (subscriber.contentEl.parentNode) {
        subscriber.contentEl.parentNode.removeChild(subscriber.contentEl);
      }
    });
    this.clear();
  }

  private static initGlobalListeners(): void {
    if (this.listenersInitialized) return;
    console.log('Global listeners initialized');
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    this.listenersInitialized = true;
  }

  private static handleKeyDown = (e: KeyboardEvent): void => {
    if (this.altKeyDown) return;
    if (matchesMacro(e, 'ShowHotkeys') && !this.altKeyDown) {
      this.altKeyDown = true;
      this.showAll();
    }
  };

  private static handleKeyUp = (e: KeyboardEvent): void => {
    if (!this.altKeyDown) return;
    if (matchesMacro(e, 'ShowHotkeys')) {
      this.altKeyDown = false;
      this.hideAll();
    }
  };

  // Optional: detach listeners for hot module reload / tests
  public static detachGlobalListeners(): void {
    if (!this.listenersInitialized) return;

    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.listenersInitialized = false;
  }
}
