// src/sequencer/matrix/Grid.ts
import { mergeGridConfig, createDefaultGridConfig } from './GridConfig.js';
import { GridConfig } from './interfaces/GridConfigTypes.js';
import { GridRenderer } from './rendering/GridRenderer.js';
import { GridScroll } from './scrollbars/GridScroll.js';
import { NoteManager } from './notes/NoteManager.js';
import { NoteRenderer } from './rendering/NoteRenderer.js';
import { NotePreviewRenderer } from './rendering/NotePreviewRenderer.js';
import { AnimationRenderer } from './rendering/AnimationRenderer.js';
import { PlayheadRenderer } from './rendering/PlayheadRenderer.js';
import { CanvasManager } from './rendering/CanvasManager.js';
import { ScrollbarManager } from './scrollbars/ScrollbarManager.js';
import { InteractionContext } from './input/InteractionContext.js';
import { CursorController } from './input/cursor/CursorController.js';
import { InputTracker } from './input/InputTracker.js';
import { WheelHandler } from './input/WheelHandler.js';
import { InteractionStore } from './input/stores/InteractionStore.js';
import { GridManager } from './GridManager.js';
import { HeaderPlayheadRenderer } from './rendering/HeaderPlayheadRenderer.js';
import { LabelColumnRenderer } from './rendering/LabelColumnRenderer.js';
import { MarqueeRenderer } from './rendering/MarqueeRenderer.js';
import { SEQUENCER_CONFIG as sequencerConfig } from '../constants/sequencerConstants.js';
import { setClipboard, getClipboard } from '../clipboard.js';
import { EventEmitter } from './events/EventEmitter.js';

import type { GridEvents } from './interfaces/GridEvents.js';
import type { TrackedNote } from './interfaces/TrackedNote.js';
import type { InteractionContextData } from './input/interfaces/InteractionContextData.js';
import type { GridSnappingContext } from './interfaces/GridSnappingContext.js';
import type { SequencerContext } from './interfaces/SequencerContext.js';

import type { Note } from '../../shared/interfaces/Note.js';
import { computeBlackKeyMidiMap } from '../../shared/utils/musical/noteUtils.js'


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

  private gridCanvasManager!: CanvasManager;
  private noteCanvasManager!: CanvasManager;
  private animationCanvasManager!: CanvasManager;
  private playheadCanvasManager!: CanvasManager;

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
    const { gridCanvas, noteCanvas, animationCanvas, playheadCanvas } = this.gridManager;
    this.gridCanvasManager = new CanvasManager(gridCanvas);
    this.noteCanvasManager = new CanvasManager(noteCanvas);
    this.animationCanvasManager = new CanvasManager(animationCanvas); 
    this.playheadCanvasManager = new CanvasManager(playheadCanvas);   

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
    this.inputTracker = new InputTracker(this.interactionContext, mainContainer)

    // Create renderers
    this.gridRenderer = new GridRenderer(this.scroll, this.config, this.interactionStore, () => this.getBlackKeyMap());
    this.noteRenderer = new NoteRenderer(this.scroll, this.config, this.noteManager, this.interactionStore, this.sequencerContext.getId());
    this.notePreviewRenderer = new NotePreviewRenderer(this.scroll, this.config, this.interactionStore, () => this.getNoteDuration());
    this.animationRenderer = new AnimationRenderer(this.scroll, this.config);
    this.headerRenderer = new HeaderPlayheadRenderer(this.scroll, this.config);
    this.labelRenderer = new LabelColumnRenderer(this.scroll, this.config, () => this.customLabels, () => this.getBlackKeyMap());
    this.playheadRenderer = new PlayheadRenderer(this.scroll, this.config);
    this.marqueeRenderer = new MarqueeRenderer(this.scroll, this.config, this.interactionStore);

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
    
    const gridCtx = this.gridCanvasManager.getContext();
    const noteCtx = this.noteCanvasManager.getContext();
    const animCtx = this.animationCanvasManager.getContext();
    const playheadCtx = this.playheadCanvasManager.getContext();
    
    this.gridRenderer.draw(gridCtx);
    this.noteRenderer.draw(noteCtx);
    this.notePreviewRenderer.draw(noteCtx);
    this.animationRenderer.draw(animCtx);
    this.labelRenderer.draw(gridCtx);
    this.headerRenderer.draw(gridCtx);
    this.playheadRenderer.draw(playheadCtx);

    if (this.interactionStore.hasMarquee()) {
      this.marqueeRenderer.draw(animCtx);
    }

    this.scrollbars.update();
  }

  public requestRedraw(): void {
    this.needsRedraw = true;
  }

  public resize(): void {
    this.gridCanvasManager.resize();
    this.noteCanvasManager.resize();
    this.animationCanvasManager.resize();
    this.playheadCanvasManager.resize(); 
  
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
    return this.sequencerConfig.isTripletMode;
  }

  // The duration of a note to be placed, e.g. 1 = whole note, 0.5 = half note, etc.
  public getNoteDuration(): number {
    return this.sequencerConfig.currentDuration;
  }

  // The resolution to snap notes to, note placement, dragging, highlighting all snap to this
  // e.g. 0.25 = quarter note, 0.125 = 8th note, 0.0625 = 16th note
  public getSnapResolution(): number {
    return this.sequencerConfig.snapResolution;
  }

  // Interaction store for the grid, used for hover/selection/etc. state
  public getInteractionStore(): InteractionStore {
    return this.interactionStore;
  }

  // Get the note manager for the grid
  public getNoteManager(): NoteManager {
    return this.noteManager;
  }

  public emit<K extends keyof GridEvents>(event: K, payload: GridEvents[K]): void {
    this.emitter.emit(event, payload);
  }

  /** Destroy the grid and its associated resources */
  public destroy(): void {
    this.inputTracker.destroy();
    this.wheelHandler.destroy();
    this.scrollbars.destroy();

    // Remove DOM elements
    this.gridManager.container.remove(); // removes all 3 canvases in one go
    this.gridCanvasManager.destroy();
    this.noteCanvasManager.destroy();
    this.animationCanvasManager.destroy();
    this.playheadCanvasManager.destroy();

    // Remove global listeners
    this.detachListeners();
    this.emitter.removeAllListeners();
    this.interactionContext.destroy();

    // Set destroyed flag for render loop
    this.isDestroyed = true;
  }
}
