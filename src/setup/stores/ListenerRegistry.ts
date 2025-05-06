// src/setup/stores/ListenerRegistry.ts

type Listener = {
    target: EventTarget;
    type: string;
    handler: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  };
  
  export class ListenerRegistry {
    private listeners: Listener[] = [];
  
    /**
     * Adds and tracks a DOM-compliant event listener with type-safe events.
     */
    public on<K extends keyof HTMLElementEventMap>(
      target: HTMLElement,
      type: K,
      handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    public on<K extends keyof WindowEventMap>(
      target: Window,
      type: K,
      handler: (this: Window, ev: WindowEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    public on<K extends keyof DocumentEventMap>(
      target: Document,
      type: K,
      handler: (this: Document, ev: DocumentEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
  
    // fallback generic for any other EventTarget
    public on(
      target: EventTarget,
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void {
      target.addEventListener(type, handler, options);
      this.listeners.push({ target, type, handler, options });
    }
  
    /**
     * Removes a specific event listener and unregisters it from the registry.
     */
    public clearHandler(
      target: EventTarget,
      type: string,
      handler: EventListenerOrEventListenerObject
    ): void {
      for (let i = this.listeners.length - 1; i >= 0; i--) {
        const listener = this.listeners[i];
        if (
          listener.target === target &&
          listener.type === type &&
          listener.handler === handler
        ) {
          target.removeEventListener(type, handler, listener.options);
          this.listeners.splice(i, 1);
        }
      }
    }
  
    /**
     * Removes all registered listeners.
     */
    public clear(): void {
      for (const { target, type, handler, options } of this.listeners) {
        target.removeEventListener(type, handler, options);
      }
      this.listeners.length = 0;
    }
  }
  