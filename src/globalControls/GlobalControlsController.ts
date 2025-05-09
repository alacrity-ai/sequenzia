import { GlobalControls } from './ui/GlobalControls.js';

import { createGlobalMiniContour } from './ui/sections/GlobalMiniContour.js';
import { createGlobalToolbar } from './ui/sections/GlobalToolbar.js';
import { createGlobalSideButtons } from './ui/sections/GlobalSideButtons.js';
import { createTransportControls } from './ui/sections/TransportControls.js';

import { attachContourListeners } from './listeners/GlobalMiniContourListeners.js';
import { attachToolbarListeners } from './listeners/GlobalToolbarListeners.js';
import { attachSideButtonListeners } from './listeners/GlobalSideButtonsListeners.js';
import { attachTransportListeners } from './listeners/TransportControlsListeners.js';
import { attachPlayheadListeners } from './listeners/GlobalPlayheadListeners.js';

import { initGlobalPlayheadRenderer } from './renderers/GlobalPlayheadRenderer.js';
import { PlaybackService } from './services/PlaybackService.js';
import { refreshGlobalMiniContour } from './renderers/GlobalMiniContourRenderer.js';

import { SaveModalController } from './modals/saveModal/saveModalController.js';
import { WavOptionsModal } from './modals/saveModal/wavOptionsModal.js';
import { LoadModalController } from './modals/loadModal/loadModalController.js';

import type { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import type { UserConfigModalController } from '@/userSettings/userConfig.js';

export class GlobalControlsController {
  private controls!: GlobalControls;
  private contour: HTMLElement | null = null;
  private miniCanvas: HTMLCanvasElement | null = null;
  private sideButtons: HTMLElement | null = null;
  private detachFns: (() => void)[] = [];
  private refreshFns: (() => void)[] = [];

  private playbackService!: PlaybackService;
  private readonly engine: PlaybackEngine;
  private readonly userConfigModalController: UserConfigModalController;

  private saveModal!: SaveModalController;
  private loadModal!: LoadModalController;
  private wavOptionsModal!: WavOptionsModal;

  constructor(engine: PlaybackEngine, userConfigModalController: UserConfigModalController) {
    this.engine = engine;
    this.userConfigModalController = userConfigModalController;
    this.playbackService = new PlaybackService(this.engine);
    this.initializeUI();
  }

  private initializeUI(): void {
    this.controls = new GlobalControls();
    this.wavOptionsModal = new WavOptionsModal();
    this.saveModal = new SaveModalController(() => this.wavOptionsModal.show());
    this.loadModal = new LoadModalController();

    const contour = createGlobalMiniContour();
    const toolbar = createGlobalToolbar();
    const { element: transport, mount: mountTransportControls } = createTransportControls();
    const sideButtons = createGlobalSideButtons();

    this.controls.getGlobalPlayheadRow().appendChild(contour);
    this.controls.getGlobalToolsRow().appendChild(toolbar);
    this.controls.getGlobalTransportRow().appendChild(transport);

    const footer = document.getElementById('footer-main');
    if (footer) {
      footer.appendChild(sideButtons);
    }
    this.miniCanvas = this.getGlobalMiniContourCanvas();

    this.sideButtons = sideButtons;
    this.contour = contour;

    const contourListeners = attachContourListeners(contour);
    const toolbarListeners = attachToolbarListeners(toolbar);
    const transportListeners = attachTransportListeners(
      transport,
      this.playbackService,
      this.userConfigModalController,
      this.saveModal,
      this.loadModal
    );
    const sideButtonListeners = attachSideButtonListeners(sideButtons);
    const playheadListeners = attachPlayheadListeners(this.controls.getGlobalPlayheadRow());

    this.detachFns = [
      contourListeners.detach,
      toolbarListeners.detach,
      transportListeners.detach,
      sideButtonListeners.detach,
      playheadListeners.detach
    ];

    this.refreshFns = [
      contourListeners.refreshUI,
      toolbarListeners.refreshUI,
      transportListeners.refreshUI,
      sideButtonListeners.refreshUI,
      playheadListeners.refreshUI
    ];

    console.log('Mini canvas  :', this.miniCanvas);
    this.miniCanvas && refreshGlobalMiniContour(this.miniCanvas);
    mountTransportControls();
    this.initPlayhead();
  }

  private initPlayhead(): void {
    if (!this.contour) return;

    const playheadCanvas = this.contour.querySelector('#global-mini-playhead') as HTMLCanvasElement | null;
    if (playheadCanvas) {
      initGlobalPlayheadRenderer(playheadCanvas);
      this.playbackService.setPlayheadCanvasWidth(playheadCanvas.width);
    }
  }

  public getPlaybackService(): PlaybackService {
    return this.playbackService;
  }

  public getGlobalMiniContourCanvas(): HTMLCanvasElement | null {
    return this.contour?.querySelector('#global-mini-contour') ?? null;
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

    if (this.sideButtons?.parentNode) {
      this.sideButtons.parentNode.removeChild(this.sideButtons);
    }
    this.sideButtons = null;

    this.wavOptionsModal?.destroy();
    this.saveModal?.destroy();
    this.loadModal?.destroy();
  }

  public reload(): void {
    this.destroy();
    this.initializeUI();
  }
}
