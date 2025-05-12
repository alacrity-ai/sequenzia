import type Sequencer from '@/components/sequencer/sequencer.js';
import type { SequencerState } from '@/appState/interfaces/AppState.js';
import type { Grid } from '@/components/sequencer/matrix/Grid.js';
import type { ZoomControlUI } from '@/components/sequencer/ui/topBar/zoomControl.js';
import type { SequencerBody } from '@/components/sequencer/ui/sequencerBody.js';
import { createSequencer } from '@/components/sequencer/factories/SequencerFactory.js';
import { unregisterSequencerController } from '@/components/sequencer/stores/sequencerControllerStore.js';

// Helpers
import { setCollapsed as collapseHelper } from '@/components/sequencer/utils/collapseSequencer.js';

// UI components
import { createSequencerBody } from '@/components/sequencer/ui/sequencerBody.js';
import { createTopBar } from '@/components/sequencer/ui/topBar.js';
import { createInstrumentSelect } from '@/components/sequencer/ui/topBar/instrumentSelect.js';
import { createVolumeControl } from '@/components/sequencer/ui/topBar/volumeControl.js';
import { createPanControl } from '@/components/sequencer/ui/topBar/panControl.js';
import { createZoomControl } from '@/components/sequencer/ui/topBar/zoomControl.js';
import { createRightControls } from '@/components/sequencer/ui/topBar/rightControls.js';

// Listeners
import { attachGripHandleListeners } from '@/components/sequencer/listeners/gripHandleListeners.js';
import { attachInstrumentSelectListeners } from '@/components/sequencer/listeners/instrumentSelectListeners.js';
import { attachVolumeControlListeners } from '@/components/sequencer/listeners/volumeControlListeners.js';
import { attachPanControlListeners } from '@/components/sequencer/listeners/panControlListeners.js';
import { attachZoomControlListeners } from '@/components/sequencer/listeners/zoomControlListeners.js';
import { attachRightControlsListeners } from '@/components/sequencer/listeners/rightControlsListeners.js';

export class SequencerController {
  private rootEl!: HTMLElement;
  private id: number | null = null;
  private sequencer!: Sequencer;
  private grid!: Grid;

  private body!: SequencerBody;
  private zoomUI: ZoomControlUI | null = null;
  private _collapsed: boolean = false;

  private detachFns: (() => void)[] = [];
  private refreshFns: (() => void)[] = [];

  constructor(parentContainer: HTMLElement, sequencerState: SequencerState, id?: number) {
    this.id = id ?? null;
    this.initializeUI(parentContainer, sequencerState);
    this.toggleZoomControls(true);
  }

  private initializeUI(parentContainer: HTMLElement, sequencerState: SequencerState): void {
    // === 1. Build base UI structure first ===
    const body = createSequencerBody();
    const topBar = createTopBar();
    this.rootEl = body.element;

    body.topBarContainer.appendChild(topBar.element);
    parentContainer.appendChild(this.rootEl);

    // === 2. Build and mount UI subcomponents ===
    const instrumentUI = createInstrumentSelect();
    const volumeUI = createVolumeControl();
    const panUI = createPanControl();
    const zoomUI = createZoomControl();
    const rightControlsUI = createRightControls();

    topBar.leftGroup.appendChild(instrumentUI.button);
    topBar.leftGroup.appendChild(instrumentUI.label)
    topBar.volumeWrapper.appendChild(volumeUI.element);
    topBar.panWrapper.appendChild(panUI.element);
    topBar.zoomWrapper.appendChild(zoomUI.element);
    topBar.rightControlsWrapper.appendChild(rightControlsUI.element);

    // === 3. Now create Sequencer model, passing wrapper ===
    const { seq } = createSequencer(this.rootEl, sequencerState, this.id!);
    this.body = body;
    this.zoomUI = zoomUI;
    this.sequencer = seq;
    this.grid = seq.matrix!;

    // === 4. Attach listeners with context ===
    const gripListeners = attachGripHandleListeners(body.gripHandleContainer, body.matrixContainer, this.grid);
    const instrumentListeners = attachInstrumentSelectListeners(instrumentUI.button, this.sequencer);
    const volumeListeners = attachVolumeControlListeners(volumeUI, this.sequencer);
    const panListeners = attachPanControlListeners(panUI, this.sequencer);
    const zoomListeners = attachZoomControlListeners(zoomUI, {
      onZoomIn: () => this.grid.zoomIn(),
      onZoomOut: () => this.grid.zoomOut(),
      onResetZoom: () => this.grid.resetZoom()
    });
    const rightControlsListeners = attachRightControlsListeners(
      rightControlsUI,
      this.sequencer,
      body.matrixContainer,
      body.gripHandleContainer,
      (collapsed) => this.collapse(collapsed),
      () => this.collapsed
    );

    // === 5. Lifecycle management ===
    this.detachFns = [
      gripListeners.detach,
      instrumentListeners.detach,
      volumeListeners.detach,
      panListeners.detach,
      zoomListeners.detach,
      rightControlsListeners.detach
    ];

    this.refreshFns = [
      gripListeners.refreshUI,
      instrumentListeners.refreshUI,
      volumeListeners.refreshUI,
      panListeners.refreshUI,
      zoomListeners.refreshUI,
      rightControlsListeners.refreshUI
    ];
  }

  public get collapsed(): boolean {
    return this._collapsed;
  }

  public set collapsed(val: boolean) {
    this._collapsed = val;
  }

  public collapse(collapsed: boolean = true): boolean {
    collapseHelper(this.sequencer, collapsed);
    return this._collapsed;
  }

  public getMiniContourCanvas(): HTMLCanvasElement | null {
    return this.body.miniContourCanvas;
  }

  public getMatrixContainer(): HTMLElement | null {
    return this.body.matrixContainer;
  }

  public getElement(): HTMLElement {
    return this.rootEl;
  }

  public refreshUI(): void {
    this.refreshFns.forEach(fn => fn());
  }

  public destroy(): void {
    this.detachFns.forEach(fn => fn());
    this.rootEl.remove();
    this.sequencer.destroy();
    unregisterSequencerController(this.sequencer.id);
  }

  public reload(): void {
    if (this.id === null || this.id === undefined) {
      console.error('[SequencerController] Cannot reload without a valid ID.');
      return;
    }

    // === 1. Get current SequencerState snapshot ===
    const currentState: SequencerState = {
      id: this.sequencer.id,
      instrument: this.sequencer.instrumentName,
      notes: structuredClone(this.sequencer.notes),
      volume: this.sequencer.volume,
      pan: this.sequencer.pan,
    };

    // === 2. Teardown current UI & sequencer ===
    this.detachFns.forEach(fn => fn());
    this.rootEl.remove();
    this.sequencer.destroy();

    // === 3. Recreate UI + Sequencer ===
    const parentContainer = document.getElementById('sequencers-container');
    if (!parentContainer) {
      console.error('[SequencerController] Cannot reload - parent container missing.');
      return;
    }

    this.initializeUI(parentContainer, currentState);
  }

  public toggleZoomControls(show: boolean): void {
    if (!this.zoomUI) return;

    const { leadingDivider, zoomInBtn, zoomOutBtn, zoomResetBtn, trailingDivider } = this.zoomUI;

    leadingDivider.classList.toggle('hidden', !show);
    zoomInBtn.classList.toggle('hidden', !show);
    zoomOutBtn.classList.toggle('hidden', !show);
    zoomResetBtn.classList.toggle('hidden', !show);
    trailingDivider.classList.toggle('hidden', !show);
  }

  public toggleGripHandle(show: boolean): void {
    const gripHandle = this.body.gripHandleContainer;
    gripHandle?.classList.toggle('hidden', !show);
  }

}
