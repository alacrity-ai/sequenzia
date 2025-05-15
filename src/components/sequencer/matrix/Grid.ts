// src/components/sequencer/matrix/Grid.ts

import { mergeGridConfig, createDefaultGridConfig } from '@/components/sequencer/matrix/GridConfig.js';
import { GridConfig } from '@/components/sequencer/matrix/interfaces/GridConfigTypes.js';
import { GridRenderer } from '@/components/sequencer/matrix/rendering/GridRenderer.js';
import { GridScroll } from '@/components/sequencer/matrix/scrollbars/GridScroll.js';
import { NoteManager } from '@/components/sequencer/matrix/notes/NoteManager.js';
import { NoteRenderer } from '@/components/sequencer/matrix/rendering/NoteRenderer.js';
import { NotePreviewRenderer } from '@/components/sequencer/matrix/rendering/NotePreviewRenderer.js';
import { AIAutocompletePreviewRenderer } from '@/components/sequencer/matrix/rendering/AIAutocompletePreviewRenderer.js';
import { AnimationRenderer } from '@/components/sequencer/matrix/rendering/AnimationRenderer.js';
import { AIAnimationRenderer } from '@/components/sequencer/matrix/rendering/AIAnimationRenderer.js';
import { PlayheadRenderer } from '@/components/sequencer/matrix/rendering/PlayheadRenderer.js';
import { CanvasManager } from '@/components/sequencer/matrix/rendering/CanvasManager.js';
import { ScrollbarManager } from '@/components/sequencer/matrix/scrollbars/ScrollbarManager.js';
import { InteractionContext } from '@/components/sequencer/matrix/input/InteractionContext.js';
import { CursorController } from '@/components/sequencer/matrix/input/cursor/CursorController.js';
import { InputTracker } from '@/components/sequencer/matrix/input/InputTracker.js';
import { WheelHandler } from '@/components/sequencer/matrix/input/WheelHandler.js';
import { InteractionStore } from '@/components/sequencer/matrix/input/stores/InteractionStore.js';
import { GridManager } from '@/components/sequencer/matrix/GridManager.js';
import { HeaderPlayheadRenderer } from '@/components/sequencer/matrix/rendering/HeaderPlayheadRenderer.js';
import { LabelColumnRenderer } from '@/components/sequencer/matrix/rendering/LabelColumnRenderer.js';
import { MarqueeRenderer } from '@/components/sequencer/matrix/rendering/MarqueeRenderer.js';
import { SEQUENCER_CONFIG as sequencerConfig } from '@/components/sequencer/constants/sequencerConstants.js';
import { setClipboard, getClipboard } from '@/components/sequencer/stores/clipboard.js';
import { EventEmitter } from '@/components/sequencer/matrix/events/EventEmitter.js';
import { getSnapResolution, getIsTripletMode } from '@/shared/playback/transportService.js';

import type { GridEvents } from '@/components/sequencer/matrix/interfaces/GridEvents.js';
import type { TrackedNote } from '@/components/sequencer/matrix/interfaces/TrackedNote.js';
import type { InteractionContextData } from '@/components/sequencer/matrix/input/interfaces/InteractionContextData.js';
import type { GridSnappingContext } from '@/components/sequencer/matrix/interfaces/GridSnappingContext.js';
import type { SequencerContext } from '@/components/sequencer/matrix/interfaces/SequencerContext.js';

import type { Note } from '@/shared/interfaces/Note.js';
import { computeBlackKeyMidiMap } from '@/shared/utils/musical/noteUtils.js'
import { getMidiNoteMap } from '@/shared/stores/songInfoStore.js';


export class Grid {
  private gridManager: GridManager;
  private config: GridConfig;
  private sequencerConfig = sequencerConfig;
  private sequencerContext!: SequencerContext;

  private scroll: GridScroll;
  private noteManager: NoteManager;
  private scrollbars: ScrollbarManager;
  private inputTracker: InputTracker;
  private interactionContext: InteractionContext;
  private wheelHandler: WheelHandler;
  private interactionStore: InteractionStore;
  private cursorController: CursorController;

  private emitter: EventEmitter<GridEvents>;

  private needsRedraw = true;
  private gridRenderer: GridRenderer;
  private noteRenderer: NoteRenderer;
  private notePreviewRenderer: NotePreviewRenderer;
  private animationRenderer: AnimationRenderer;
  private headerRenderer: HeaderPlayheadRenderer;
  private labelRenderer: LabelColumnRenderer;
  private playheadRenderer: PlayheadRenderer;
  private marqueeRenderer: MarqueeRenderer;
  private aiAutocompletePreviewRenderer: AIAutocompletePreviewRenderer;
  private aiAnimationRenderer: AIAnimationRenderer;

  private gridCanvasManager!: CanvasManager;
  private noteCanvasManager!: CanvasManager;
  private animationCanvasManager!: CanvasManager;
  private playheadCanvasManager!: CanvasManager;
  private aipreviewCanvasManager!: CanvasManager;
  private aiAnimationCanvasManager!: CanvasManager;

  private initialZoom!: number;
  private customLabels: Record<number, string> | null = null;
  private blackKeyMap: Map<number, boolean> = new Map();

  private isDestroyed = false;
  
  constructor(parent: HTMLElement, config: Partial<GridConfig> = {}, sequencerContext: SequencerContext) {
    this.config = mergeGridConfig(createDefaultGridConfig(), config);
    this.sequencerContext = sequencerContext;
    this.recalculateLabelAndHeader();

    // Create canvas managers for our canvases
    this.gridManager = new GridManager(parent);
    const { gridCanvas, noteCanvas, animationCanvas, playheadCanvas, aipreviewCanvas, aiAnimationCanvas } = this.gridManager;
    this.gridCanvasManager = new CanvasManager(gridCanvas);
    this.noteCanvasManager = new CanvasManager(noteCanvas);
    this.animationCanvasManager = new CanvasManager(animationCanvas); 
    this.playheadCanvasManager = new CanvasManager(playheadCanvas);
    this.aipreviewCanvasManager = new CanvasManager(aipreviewCanvas);
    this.aiAnimationCanvasManager = new CanvasManager(aiAnimationCanvas); 

    // Create components
    const mainContainer = this.gridManager.container
    this.noteManager = new NoteManager(this.config, this.sequencerContext.playNote);
    this.interactionStore = new InteractionStore();
    this.emitter = new EventEmitter<GridEvents>();
    this.scroll = new GridScroll(mainContainer, this.config);
    this.scrollbars = new ScrollbarManager(mainContainer, this.scroll, this.config, this.interactionStore, () => this.requestRedraw());
    this.wheelHandler = new WheelHandler(mainContainer, this.scroll, () => this.requestRedraw());
    this.cursorController = new CursorController(mainContainer);

    // Interaction
    const contextData: InteractionContextData = {
      canvas: noteCanvas,
      noteManager: this.noteManager,
      scroll: this.scroll,
      config: this.config,
      store: this.interactionStore,
      grid: this as GridSnappingContext,
      addNote: (note) => this.noteManager.add(note),
      requestRedraw: () => this.requestRedraw(),
      sequencerContext: sequencerContext,
      cursorController: this.cursorController,
      setClipboard,
      getClipboard,
      playNoteAnimation: (note) => this.playNoteAnimation(note)
    };
    this.interactionContext = new InteractionContext(contextData);
    this.inputTracker = new InputTracker(
      this.interactionContext,
      mainContainer,
      {
        getId: () => this.sequencerContext.getId(),
        isCollapsed: () => this.sequencerContext.isCollapsed()
      }
    );

    // Create renderers
    this.gridRenderer = new GridRenderer(this.scroll, this.config, this.interactionStore, () => this.getBlackKeyMap(), () => getMidiNoteMap());
    this.noteRenderer = new NoteRenderer(this.scroll, this.config, this.noteManager, this.interactionStore, this.sequencerContext.getId());
    this.notePreviewRenderer = new NotePreviewRenderer(this.scroll, this.config, this.interactionStore, () => this.getNoteDuration());
    this.animationRenderer = new AnimationRenderer(this.scroll, this.config);
    this.headerRenderer = new HeaderPlayheadRenderer(this.scroll, this.config);
    this.labelRenderer = new LabelColumnRenderer(this.scroll, this.config, () => this.customLabels, () => this.getBlackKeyMap());
    this.playheadRenderer = new PlayheadRenderer(this.scroll, this.config);
    this.marqueeRenderer = new MarqueeRenderer(this.scroll, this.config, this.interactionStore);
    this.aiAutocompletePreviewRenderer = new AIAutocompletePreviewRenderer(this.scroll, this.config);
    this.aiAnimationRenderer = new AIAnimationRenderer(this.scroll, this.config, this.aiAnimationCanvasManager.getContext());

    // Create initial values (for resetting)
    this.initialZoom = this.zoom;

    // Initialize custom labels as null
    this.customLabels = null;

    // Defer resize until layout is ready
    requestAnimationFrame(() => this.resize());
    
    this.playheadRenderer.setPlayheadX(0);
    this.attachListeners();
    this.renderLoop();
  }

  private readonly onWindowResize = () => this.resize();

  private attachListeners(): void {
    window.addEventListener('resize', this.onWindowResize);
  }
  
  private detachListeners(): void {
    window.removeEventListener('resize', this.onWindowResize);
  }  

  private renderLoop(): void {
    if (this.isDestroyed) return;
    if (this.needsRedraw) {
      this.render();
      this.needsRedraw = false;
    }
    requestAnimationFrame(() => this.renderLoop());
  }

  private recalculateLabelAndHeader(): void {
    const {
      baseCellWidth,
      verticalCellRatio,
      labelWidthColumns,
      headerHeightRows
    } = this.config.layout;
  
    const zoom = this.zoom;
    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;
  
    this.config.layout.labelWidth = labelWidthColumns * cellWidth;
    this.config.layout.headerHeight = headerHeightRows * cellHeight;
  }
  
  private get zoom(): number {
    return this.config.behavior.zoom;
  }

  private set zoom(value: number) {
    this.config.behavior.zoom = value;
  }

  // Public API

  public get notes(): Note[] {
    const notes = this.noteManager.getAll();
    if (notes) {
      return notes;
    }
    return [] as Note[];
  }

  public render(): void {
    this.gridCanvasManager.clear();
    this.noteCanvasManager.clear();
    this.animationCanvasManager.clear();
    this.playheadCanvasManager.clear();
    this.aipreviewCanvasManager.clear();
    
    const gridCtx = this.gridCanvasManager.getContext();
    const noteCtx = this.noteCanvasManager.getContext();
    const animCtx = this.animationCanvasManager.getContext();
    const playheadCtx = this.playheadCanvasManager.getContext();
    const aipreviewCtx = this.aipreviewCanvasManager.getContext();
    
    this.gridRenderer.draw(gridCtx);
    this.noteRenderer.draw(noteCtx);
    this.notePreviewRenderer.draw(noteCtx);
    this.animationRenderer.draw(animCtx);
    this.labelRenderer.draw(gridCtx);
    this.headerRenderer.draw(gridCtx);
    this.playheadRenderer.draw(playheadCtx);
    this.aiAutocompletePreviewRenderer.draw(aipreviewCtx);

    if (this.interactionStore.hasMarquee()) {
      this.marqueeRenderer.draw(animCtx);
    }

    this.scrollbars.update();
  }

  public setConfig(config: Partial<GridConfig>): void {
    this.config = mergeGridConfig(this.config, config);
    this.recalculateLabelAndHeader();
    this.requestRedraw();
  }

  public getConfig(): GridConfig {
    return this.config;
  }

  public requestRedraw(): void {
    this.needsRedraw = true;
  }

  public resize(): void {
    this.gridCanvasManager.resize();
    this.noteCanvasManager.resize();
    this.animationCanvasManager.resize();
    this.playheadCanvasManager.resize();
    this.aipreviewCanvasManager.resize();
    this.aiAnimationCanvasManager.resize();
  
    this.scroll.recalculateBounds();
    this.scrollbars.update();
    this.requestRedraw();
  }

  public on<K extends keyof GridEvents>(event: K, callback: (payload: GridEvents[K]) => void): void {
    this.emitter.on(event, callback);
  }

  public off<K extends keyof GridEvents>(event: K, callback: (payload: GridEvents[K]) => void): void {
    this.emitter.off(event, callback);
  }

  public setPlayheadPixelX(x: number): void {
    this.playheadRenderer.setPlayheadX(x);
    this.requestRedraw();
  }

  public getPixelsPerBeat(): number {
    return this.config.layout.baseCellWidth * this.config.behavior.zoom;
  }  

  // In the Grid (matrix) class
  public setNotes(notes: Note[]): void {
    this.noteManager.set(notes);
    this.requestRedraw();
  }

  public playNoteAnimation(note: Note): void {
    this.animationRenderer.playNote(note);
  }

  public invalidateAIAutocompleteRenderer(): void {
    this.aiAnimationRenderer.invalidate();
  }

  public startAIAutocompleteAnimationLoop(): void {
    this.aiAnimationRenderer.start();
  }

  public stopAIAutocompleteAnimationLoop(): void {
    this.aiAnimationRenderer.stop();
  }

  public setActiveAutocompleteBar(barIndex: number | null): void {
    this.aiAnimationRenderer.setActiveAutocompleteBar(barIndex);
    requestAnimationFrame(this.aiAnimationRenderer.renderFrame)
  }

  public playNoteAcceptanceAnimation(notes: Note[]): void {
    this.aiAnimationRenderer.playNoteAcceptance(notes);
  }

  public getTrackedNotes(): TrackedNote[] {
    return this.noteManager.getTrackedNotes(this.interactionStore);
  }

  public scrollTo(x: number, y: number): void {
    this.scroll.setScroll(x, y);
    this.scrollbars.update();
    this.requestRedraw();
  }

  public setZoom(level: number): void {
    this.zoom = level;
    this.scroll.recalculateBounds();
    this.recalculateLabelAndHeader();
    this.requestRedraw();
  }

  public getZoom(): number {
    return this.zoom;
  }

  public resetZoom(): void {
    this.setZoom(this.initialZoom);
  }

  public zoomIn(): void {
    this.setZoom(Math.min(this.config.behavior.maxZoom, this.zoom + 0.1));
  }
  
  public zoomOut(): void {
    this.setZoom(Math.max(this.config.behavior.minZoom, this.zoom - 0.1));
  }

  public setCustomLabels(labels: Record<number, string> | null): void {
    this.customLabels = labels;
    this.requestRedraw();
  }

  public getMeasures(): number {
    return this.config.totalMeasures;
  }

  public setMeasures(measures: number): void {
    this.config.totalMeasures = Math.max(1, measures);
    this.scroll.recalculateBounds();
    this.requestRedraw();
  }

  public getBeatsPerMeasure(): number {
    return this.config.beatsPerMeasure;
  }

  public setBeatsPerMeasure(beats: number): void {
    this.config.beatsPerMeasure = Math.max(1, beats);
    this.scroll.recalculateBounds();
    this.requestRedraw();
  }

  public getTotalBeats(): number {
    return this.config.totalMeasures * this.config.beatsPerMeasure;
  }

  // The MIDI note range of the grid (determines the rows)
  public setNoteRange(lowestMidi: number, highestMidi: number): void {
    this.config.layout.lowestMidi = lowestMidi;
    this.config.layout.highestMidi = highestMidi;
    
    this.blackKeyMap = computeBlackKeyMidiMap(lowestMidi, highestMidi);
    this.scroll.recalculateBounds();
    this.recalculateLabelAndHeader();
    this.resize();
    this.requestRedraw();
  }

  public refreshNoteRange(): void {
    this.setNoteRange(this.config.layout.lowestMidi, this.config.layout.highestMidi);
  }

  public getBlackKeyMap(): Map<number, boolean> {
    return this.blackKeyMap;
  }  

  // Whether the grid is in triplet mode or not, effects snapping/note placement
  public isTripletMode(): boolean {
    return getIsTripletMode();
  }

  // The duration of a note to be placed, e.g. 1 = whole note, 0.5 = half note, etc.
  public getNoteDuration(): number {
    return this.sequencerConfig.currentDuration;
  }

  // The resolution to snap notes to, note placement, dragging, highlighting all snap to this
  // e.g. 0.25 = quarter note, 0.125 = 8th note, 0.0625 = 16th note
  public getSnapResolution(): number {
    return getSnapResolution();
  }

  // Interaction store for the grid, used for hover/selection/etc. state
  public getInteractionStore(): InteractionStore {
    return this.interactionStore;
  }

  public getNoteManager(): NoteManager {
    return this.noteManager;
  }

  public getInteractionContext(): InteractionContext {
    return this.interactionContext;
  }

  public emit<K extends keyof GridEvents>(event: K, payload: GridEvents[K]): void {
    this.emitter.emit(event, payload);
  }

  /** Destroy the grid and its associated resources */
  public destroy(): void {
    this.inputTracker.destroy();
    this.wheelHandler.destroy();
    this.scrollbars.destroy();

    // Stop any lingering animations
    this.aiAnimationRenderer.stop();

    // Remove DOM elements
    this.gridManager.container.remove(); // removes all 3 canvases in one go
    this.gridCanvasManager.destroy();
    this.noteCanvasManager.destroy();
    this.animationCanvasManager.destroy();
    this.playheadCanvasManager.destroy();
    this.aipreviewCanvasManager.destroy();
    this.aiAnimationCanvasManager.destroy();

    // Remove global listeners
    this.detachListeners();
    this.emitter.removeAllListeners();
    this.interactionContext.destroy();

    // Set destroyed flag for render loop
    this.isDestroyed = true;
  }
}
