// src/components/globalControls/GlobalControlsController.ts

import { GlobalControls } from '@/components/globalControls/ui/GlobalControls.js';

import { createGlobalMiniContour } from '@/components/globalControls/ui/sections/GlobalMiniContour.js';
import { createGlobalToolbar } from '@/components/globalControls/ui/sections/GlobalToolbar.js';
import { createGlobalSideButtons } from '@/components/globalControls/ui/sections/GlobalSideButtons.js';
import { createTransportControls } from '@/components/globalControls/ui/sections/TransportControls.js';

import { attachContourListeners } from '@/components/globalControls/listeners/GlobalMiniContourListeners.js';
import { attachToolbarListeners } from '@/components/globalControls/listeners/GlobalToolbarListeners.js';
import { attachSideButtonListeners } from '@/components/globalControls/listeners/GlobalSideButtonsListeners.js';
import { attachTransportListeners } from '@/components/globalControls/listeners/TransportControlsListeners.js';
import { attachPlayheadListeners } from '@/components/globalControls/listeners/GlobalPlayheadListeners.js';
import { attachGlobalControlsListeners } from '@/components/globalControls/listeners/GlobalControlsListeners.js';

import { initGlobalPlayheadRenderer } from '@/components/globalControls/renderers/GlobalPlayheadRenderer.js';
import { PlaybackService } from '@/components/globalControls/services/PlaybackService.js';

import { SaveModalController } from '@/components/globalControls/modals/saveModal/saveModalController.js';
import { WavOptionsModal } from '@/components/globalControls/modals/saveModal/wavOptionsModal.js';
import { LoadModalController } from '@/components/globalControls/modals/loadModal/loadModalController.js';
import { VelocityModalController } from '@/components/globalControls/modals/velocity/velocityModalController.js';
import { WhatsNewModalController } from '@/components/globalControls/modals/whatsNew/whatsNewModalController.js';

import type { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import type { UserConfigModalController } from '@/components/userSettings/userConfig.js';

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
  private velocityModal!: VelocityModalController;
  private whatsNewModal!: WhatsNewModalController;

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
    this.velocityModal = new VelocityModalController();
    this.whatsNewModal = new WhatsNewModalController();

    const contour = createGlobalMiniContour();
    const toolbar = createGlobalToolbar();
    const transport = createTransportControls();
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
    const sideButtonListeners = attachSideButtonListeners(sideButtons, this.whatsNewModal);
    const playheadListeners = attachPlayheadListeners(this.controls.getGlobalPlayheadRow());
    const globalControlsListeners = attachGlobalControlsListeners({ velocity: this.velocityModal});

    this.detachFns = [
      contourListeners.detach,
      toolbarListeners.detach,
      transportListeners.detach,
      sideButtonListeners.detach,
      playheadListeners.detach,
      globalControlsListeners.detach
    ];

    this.refreshFns = [
      contourListeners.refreshUI,
      toolbarListeners.refreshUI,
      transportListeners.refreshUI,
      sideButtonListeners.refreshUI,
      playheadListeners.refreshUI,
      globalControlsListeners.refreshUI
    ];

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
    this.velocityModal?.destroy();
    this.whatsNewModal?.destroy();
  }

  public reload(): void {
    this.destroy();
    this.initializeUI();
  }
}
