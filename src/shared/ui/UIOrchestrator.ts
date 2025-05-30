// src/shared/ui/UIOrchestrator.ts

import { PopoverEmitter } from './PopoverEmitter.js';

export class UIOrchestrator {
    private static instance: UIOrchestrator;
  
    private reloadCallbacks: (() => void)[] = [];
  
    private constructor() {}
  
    public static getInstance(): UIOrchestrator {
      if (!UIOrchestrator.instance) {
        UIOrchestrator.instance = new UIOrchestrator();
      }
      return UIOrchestrator.instance;
    }
  
    public registerReloadable(callback: () => void): void {
      this.reloadCallbacks.push(callback);
    }
  
    public unregisterReloadable(callback: () => void): void {
      this.reloadCallbacks = this.reloadCallbacks.filter(fn => fn !== callback);
    }

    public reloadAll(): void {
      PopoverEmitter.destroyAll();
      this.reloadCallbacks.forEach(fn => fn());
    }
  }
  