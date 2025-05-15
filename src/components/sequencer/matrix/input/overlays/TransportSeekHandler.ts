// src/sequencer/matrix/input/overlays/TransportSeekHandler.ts

import type { OverlayHandler } from '@/components/sequencer/matrix/input/interfaces/OverlayHandler.js';
import type { GridConfig } from '@/components/sequencer/matrix/interfaces/GridConfigTypes.js';
import type { GridScroll } from '@/components/sequencer/matrix/scrollbars/GridScroll.js';
import type { SequencerConfig } from '@/components/sequencer/interfaces/SequencerConfig.js';
import type { CursorController } from '@/components/sequencer/matrix/input/cursor/CursorController.js';
import type { InteractionStore } from '@/components/sequencer/matrix/input/stores/InteractionStore.js';

import { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import { setAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { updateAllMatrixPlayheads } from '@/shared/playback/helpers/updateAllGridPlayheads.js';
import { getSnappedBeat } from '@/components/sequencer/utils/snappedBeat.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState.js';
import { isInHeaderBounds } from '@/components/sequencer/matrix/utils/isInHeaderBounds.js';

import { drawGlobalPlayhead } from '@/components/globalControls/renderers/GlobalPlayheadRenderer.js';
import { drawGlobalMiniContour } from '@/shared/playback/helpers/drawGlobalMiniContour.js';
import { getAIIndicatorEnabled } from '@/components/userSettings/store/userConfigStore.js';

export class TransportSeekHandler implements OverlayHandler {
  private isDragging = false;
  private wasAutoPaused = false;
  
  // Auto Scrolling
  private readonly AUTO_SCROLL_ZONE_PX = 20;
  private readonly AUTO_SCROLL_SPEED_PX = 10;
  private autoScrollTimer: number | null = null;
  private currentPointerX: number | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly scroll: GridScroll,
    private readonly config: GridConfig,
    private readonly sequencerConfig: SequencerConfig, 
    private readonly requestRedraw: () => void,
    private readonly getSequencerId: () => number,
    private readonly cursorController: CursorController,
    private readonly store: InteractionStore
  ) {}

  private updatePlayheadFromEvent(e: MouseEvent): void {
    if (!isInHeaderBounds(e, this.canvas, this.config)) return;

    const rect = this.canvas.getBoundingClientRect();
    const labelWidth = this.config.layout.labelWidth;

    const cellWidth = this.config.layout.baseCellWidth * this.config.behavior.zoom;
    const rawX = e.clientX - rect.left + this.scroll.getX() - labelWidth;
    const unsnappedBeat = rawX / cellWidth;

    const totalBeats = getTotalBeats();
    const snappedBeat = getSnappedBeat(unsnappedBeat, this.sequencerConfig);
    const clampedBeat = Math.max(0, Math.min(totalBeats, snappedBeat));

    const playbackEngine = PlaybackEngine.getInstance();
    playbackEngine.seek(clampedBeat);

    setAutoCompleteTargetBeat(clampedBeat);
    updateAllMatrixPlayheads(playbackEngine, clampedBeat);

    this.requestRedraw();

    // === NEW: Sync global playhead ===
    const globalCanvas = document.querySelector<HTMLCanvasElement>('#global-mini-playhead');
    if (globalCanvas) {
      const DPR = window.devicePixelRatio || 1;
      const logicalWidth = globalCanvas.width / DPR;
      const snappedX = (clampedBeat / totalBeats) * logicalWidth;

      drawGlobalPlayhead(snappedX);
    }

    if (getAIIndicatorEnabled()) {
      drawGlobalMiniContour();
    }
  }

  public onMouseDown(e: MouseEvent): boolean {
    if (!isInHeaderBounds(e, this.canvas, this.config)) return false;

    const playbackEngine = PlaybackEngine.getInstance();

    if (playbackEngine.isActive()) {
      playbackEngine.pause().then(() => {
        this.wasAutoPaused = true;
      });
    }

    this.isDragging = true;
    
    // Autoscroll
    this.currentPointerX = e.clientX;
    this.startAutoScrollLoop();

    this.updatePlayheadFromEvent(e);
    this.cursorController.set(CursorState.Grabbing);
    return true;
  }

  public onMouseMove(e: MouseEvent): boolean {
    if (!isInHeaderBounds(e, this.canvas, this.config)) return false;

    this.currentPointerX = e.clientX;

    if (this.isDragging) {
      this.updatePlayheadFromEvent(e);
      this.cursorController.set(CursorState.Grabbing);
    } else {
      this.cursorController.set(CursorState.Grab);
    }

    // Clear preview notes while in header
    this.store.setSnappedCursorGridPosition(null);
    this.store.setHoveredNoteKey(null);
    this.requestRedraw();

    return true;
  }

  public onMouseUp(e: MouseEvent): boolean {
    if (!this.isDragging) return false;

    this.updatePlayheadFromEvent(e);
    this.isDragging = false;

    if (this.wasAutoPaused) {
      PlaybackEngine.getInstance().resume();
      this.wasAutoPaused = false;
    }

    this.currentPointerX = null;
    this.stopAutoScrollLoop();

    this.cursorController.set(CursorState.Grab);
    return true;
  }

  public onGlobalMouseUp(e: MouseEvent): boolean {
    return this.onMouseUp(e);
  }

  public onContextMenu(e: MouseEvent): boolean {
    return false;
  }

  public onMouseLeave(): boolean {
    if (!this.isDragging) {
      this.cursorController.set(CursorState.Default);
    }
    return false;
  }

  public onMouseEnter(e: MouseEvent): boolean {
    if (isInHeaderBounds(e, this.canvas, this.config)) {
      this.cursorController.set(this.isDragging ? CursorState.Grabbing : CursorState.Grab);
      return true;
    }
    return false;
  }

  public onKeyDown(e: KeyboardEvent): boolean {
    return false;
  }

  private startAutoScrollLoop(): void {
    if (this.autoScrollTimer !== null) return; // already running

    const step = () => {
      if (!this.isDragging) {
        this.stopAutoScrollLoop();
        return;
      }

      const rect = this.canvas.getBoundingClientRect();
      const pointerX = this.currentPointerX;
      if (pointerX === undefined || !pointerX) {
        this.stopAutoScrollLoop();
        return;
      }

      let scrollDelta = 0;

      if (pointerX < rect.left + this.AUTO_SCROLL_ZONE_PX) {
        scrollDelta = -this.AUTO_SCROLL_SPEED_PX;
      } else if (pointerX > rect.right - this.AUTO_SCROLL_ZONE_PX) {
        scrollDelta = this.AUTO_SCROLL_SPEED_PX;
      }

      if (scrollDelta !== 0) {
        const newX = this.scroll.getX() + scrollDelta;
        this.scroll.setScroll(newX, this.scroll.getY());
        this.requestRedraw();
      }

      this.autoScrollTimer = requestAnimationFrame(step);
    };

    this.autoScrollTimer = requestAnimationFrame(step);
  }

  private stopAutoScrollLoop(): void {
    if (this.autoScrollTimer !== null) {
      cancelAnimationFrame(this.autoScrollTimer);
      this.autoScrollTimer = null;
    }
  }

  public destroy(): void {
    // No-op for now, but ready for future listener cleanup etc.
  }
}
