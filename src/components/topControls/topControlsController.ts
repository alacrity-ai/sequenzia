// src/components/topControls/topControlsController.ts

import { KeyboardController } from './components/keyboard/keyboardController.js';
// import { AiMenuController } from './components/aimenu/aiMenuController.js';
// import { MixerController } from './components/mixer/mixerController.js';

type TopControlsMode = 'keyboard' | 'ai' | 'mixer';

export class TopControlsController {
  private container: HTMLElement;
  private activeMode: TopControlsMode = 'keyboard';

  private keyboardController!: KeyboardController;
  // private aiMenuController!: AiMenuController;
  // private mixerController!: MixerController;

  private activeElement: HTMLElement | null = null;
  private detachFns: (() => void)[] = [];

  constructor() {
    const target = document.getElementById('top-controls-container');
    if (!target) throw new Error('#top-controls-container not found in DOM');
    this.container = target;

    this.initialize();
  }

  private initialize(): void {
    // === Instantiate Controllers (but do not inject yet) ===
    this.keyboardController = new KeyboardController();
    // this.aiMenuController = new AiMenuController();
    // this.mixerController = new MixerController();

    // Mount default view
    this.setMode('keyboard');
  }

  public setMode(mode: TopControlsMode): void {
    // Unconditionally switch mode if not yet mounted
    if (this.activeElement) {
      if (this.activeMode === mode) return; // Only skip if already active *and* mounted
      this.container.removeChild(this.activeElement);
      this.activeElement = null;
    }

    this.activeMode = mode;

    switch (mode) {
      case 'keyboard':
        this.activeElement = this.keyboardController.render();
        this.container.appendChild(this.activeElement);
        this.keyboardController.initialize();
        break;

      case 'ai':
        this.activeElement = this.createStub('AI View not implemented');
        this.container.appendChild(this.activeElement);
        break;

      case 'mixer':
        this.activeElement = this.createStub('Mixer View not implemented');
        this.container.appendChild(this.activeElement);
        break;
    }
  }

  public getCurrentMode(): TopControlsMode {
    return this.activeMode;
  }

  public destroy(): void {
    this.detachFns.forEach(fn => fn());
    this.detachFns = [];

    this.keyboardController?.destroy();
    // this.aiMenuController?.destroy();
    // this.mixerController?.destroy();

    if (this.activeElement?.parentNode === this.container) {
      this.container.removeChild(this.activeElement);
    }
    this.activeElement = null;
  }

  public reload(): void {
    this.destroy();
    this.initialize();
  }

  private createStub(message: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'text-gray-400 text-sm p-4 border border-gray-600 rounded';
    el.textContent = message;
    return el;
  }
}
