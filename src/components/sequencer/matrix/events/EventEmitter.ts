// src/sequencer/matrix/events/EventEmitter.ts

export type EventCallback<T> = (payload: T) => void;

export class EventEmitter<Events extends { [key: string]: unknown }> {
  private listeners: { [K in keyof Events]?: Set<EventCallback<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(callback);
  }

  off<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
    this.listeners[event]?.delete(callback);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach(callback => callback(payload));
  }

  clear<K extends keyof Events>(event: K): void {
    this.listeners[event]?.clear();
  }

  removeAllListeners(): void {
    for (const key in this.listeners) {
      this.listeners[key as keyof Events]?.clear();
    }
  }  
}
