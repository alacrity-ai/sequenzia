// src/shared/ui/UIOrchestrator.ts
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
  
    public reloadAll(): void {
      this.reloadCallbacks.forEach(fn => fn());
    }
  }
  