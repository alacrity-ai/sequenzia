// src/globalControls/GlobalControlsController.ts

import { GlobalControls } from './ui/GlobalControls.js';

import { createGlobalMiniContour } from './ui/sections/GlobalMiniContour.js';
import { createGlobalToolbar } from './ui/sections/GlobalToolbar.js';
import { createGlobalSideButtons } from './ui/sections/GlobalSideButtons.js';
import { createTransportControls } from './ui/sections/TransportControls.js';

import { attachContourListeners } from './listeners/GlobalMiniContourListeners.js';
import { attachToolbarListeners } from './listeners/GlobalToolbarListeners.js';
import { attachSideButtonListeners } from './listeners/GlobalSideButtonsListeners.js';
import { attachTransportListeners } from './listeners/TransportControlsListeners.js';

export class GlobalControlsController {
  private controls: GlobalControls;
  private detachFns: (() => void)[] = [];
  private refreshFns: (() => void)[] = [];

  constructor() {
    this.controls = new GlobalControls();

    // === Create UI sections ===
    const contour = createGlobalMiniContour();
    const sideButtons = createGlobalSideButtons();
    const toolbar = createGlobalToolbar();
    const transport = createTransportControls();

    // === Inject into layout ===
    this.controls.getMiniContourWrapper().appendChild(contour);
    this.controls.getLeftSideButtonsWrapper().appendChild(sideButtons);
    this.controls.getToolbarWrapper().appendChild(toolbar);
    this.controls.getTransportWrapper().appendChild(transport);

    // === Attach listeners ===
    const contourListeners = attachContourListeners(contour);
    const sideButtonListeners = attachSideButtonListeners(sideButtons);
    const toolbarListeners = attachToolbarListeners(toolbar);
    const transportListeners = attachTransportListeners(transport);

    this.detachFns.push(
      contourListeners.detach,
      sideButtonListeners.detach,
      toolbarListeners.detach,
      transportListeners.detach
    );

    this.refreshFns.push(
      sideButtonListeners.refreshUI,
      toolbarListeners.refreshUI,
      transportListeners.refreshUI
    );
  }

  public show(): void {
    this.refreshFns.forEach(fn => fn());
    this.controls.render().classList.remove('hidden');
  }

  public hide(): void {
    this.controls.render().classList.add('hidden');
  }

  public destroy(): void {
    this.detachFns.forEach(fn => fn());
    this.controls.destroy();
  }
}
