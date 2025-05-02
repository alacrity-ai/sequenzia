// src/sequencer/initGrid.js

import { getSnappedBeatFromX } from './grid/helpers/geometry.js';
import { pitchToMidi, midiToPitch, getPitchClass } from '../sounds/audio/pitch-utils.js';
import { drawRoundedRect } from './grid/drawing/rounded-rect.js';
import { drawGridBackground } from './grid/drawing/grid-background.js';
import { drawNotes, drawOverlayNotes } from './grid/drawing/note-renderer.js';
import { drawPlayhead } from './grid/drawing/playhead-renderer.js';
import { getCanvasPos } from './grid/helpers/canvas-coords.js';
import { findNoteAt } from '../sequencer/grid/helpers/note-finder.js';
import { drawGlobalMiniContour } from './grid/drawing/mini-contour.js';
import { sequencers } from '../setup/sequencers.js'; 
import { getTotalBeats } from '../sequencer/transport.js';
import { initZoomControls } from './grid/interaction/zoomControlButtonHandlers.js';
import { getNotePlacementHandlers } from './grid/interaction/noteModeMouseHandlers.js';
import { getSelectModeHandlers } from './grid/interaction/selectModeMouseHandlers.js';
import { getHoveredResizeNote } from './grid/interaction/sharedMouseListeners.js';
import { subscribeEditMode, getEditMode } from '../setup/stores/editModeStore.js';
import { clearSelectionTracker } from '../setup/stores/selectionTracker.js';
import { drawMarqueeSelectionBox } from './grid/drawing/selection-box.js';
import { drawResizeArrow } from './grid/drawing/resize-arrow.js';
import { ZOOM_LEVELS, labelWidth } from './grid/helpers/constants.js';
import { getTrackColorFromSequencer } from './grid/helpers/sequencerColors.js';
import { midiRangeBetween } from './grid/helpers/note-finder.js';

import { EditMode } from './interfaces/EditMode.js';
import { Grid } from './interfaces/Grid.js';
import { HandlerContext } from './interfaces/HandlerContext.js';
import { MouseHandler } from './interfaces/MouseHandler.js';
import { GridConfig } from './interfaces/GridConfig.js';
import { Note } from './interfaces/Note.js';


export function initGrid(
  canvas: HTMLCanvasElement,
  playheadCanvas: HTMLCanvasElement,
  animationCanvas: HTMLCanvasElement,
  scrollContainer: HTMLElement,
  notes: Note[],
  config: GridConfig,
  sequencer: any
): Grid {  
  let previewNote: Note | null = null;
  let pastePreviewNote: Note | null = null;
  let pastePreviewNotes: Note[] | null = null;
  let hoveredNote: Note | null = null; // defined here as Note | null
  let selectedNote: Note | null = null;
  let selectedNotes: Note[] = [];

  let playheadX = null;
  
  let zoomIndex = 2; // start at default level  

  // Contexts
  const ctx = canvas.getContext('2d');
  const playheadCtx = playheadCanvas.getContext('2d');
  const animCtx = animationCanvas.getContext('2d');
  
  if (!ctx || !playheadCtx || !animCtx) {
    throw new Error('Failed to acquire required canvas contexts');
  }
  
  // Caste for safety
  const safeCtx = ctx as CanvasRenderingContext2D;
  const safePlayheadCtx = playheadCtx as CanvasRenderingContext2D;
  const safeAnimCtx = animCtx as CanvasRenderingContext2D | null;
  
  let cellWidth = ZOOM_LEVELS[zoomIndex].cellWidth;
  let cellHeight = ZOOM_LEVELS[zoomIndex].cellHeight;  

  const visibleNotes = midiRangeBetween(config.noteRange[1], config.noteRange[0]) + 1;
  const fullHeight = visibleNotes * cellHeight;
  const totalBeats = getTotalBeats();  
  const fullWidth = totalBeats * cellWidth + labelWidth;
  
  // Set canvas dimensions
  canvas.width = fullWidth;
  canvas.height = fullHeight;
  canvas.style.width = `${fullWidth}px`;
  canvas.style.height = `${fullHeight}px`;

  playheadCanvas.width = fullWidth;
  playheadCanvas.height = fullHeight;
  playheadCanvas.style.width = `${fullWidth}px`;
  playheadCanvas.style.height = `${fullHeight}px`;

  // Set up the animation canvas
  animationCanvas.width = fullWidth;
  animationCanvas.height = fullHeight;
  animationCanvas.style.width = `${fullWidth}px`;
  animationCanvas.style.height = `${fullHeight}px`;

  let frameId: number | null = null;
  function scheduleRedraw() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(drawGrid);
  }

  let scrollRedrawQueued = false;

  scrollContainer.addEventListener('scroll', () => {
    if (scrollRedrawQueued) return;
  
    scrollRedrawQueued = true;
    requestAnimationFrame(() => {
      scrollRedrawQueued = false;
      scheduleRedraw(); // Triggers drawGrid
    });
  });  

  function getVisibleNotes(
    notes: Note[],
    scrollContainer: HTMLElement,
    labelWidth: number,
    cellWidth: number,
    overscan = 2
  ): Note[] {
    const scrollLeft = scrollContainer.scrollLeft;
    const clientWidth = scrollContainer.clientWidth;
  
    const visibleStartBeat = Math.floor((scrollLeft - labelWidth) / cellWidth);
    const visibleEndBeat = Math.ceil((scrollLeft + clientWidth - labelWidth) / cellWidth);
  
    const visible: Note[] = [];
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      if (n.start + n.duration >= visibleStartBeat - overscan && n.start <= visibleEndBeat) {
        visible.push(n);
      }
    }
    return visible;
  }  

  function drawGrid() {
    // Clear the canvas
    safeCtx.clearRect(0, 0, canvas.width, canvas.height);
    safeCtx.save();

    // Translate the canvas for the note label (piano roll)
    safeCtx.translate(labelWidth, 0);

    const notesToDraw = getVisibleNotes(notes, scrollContainer, labelWidth, cellWidth);

    // Draw the grid background (different amount of rows/labels for drums)
    let drumMode = (sequencer.instrumentName?.toLowerCase().includes('drum kit ') ?? false);
    drawGridBackground(safeCtx, config, visibleNotes, cellWidth, cellHeight, getPitchFromRow, drumMode);

    drawNotes(safeCtx, notesToDraw, {
      cellWidth,
      cellHeight,
      visibleStartBeat: 0,
      visibleEndBeat: canvas.width / cellWidth,
      getPitchRow,
      getPitchClass,
      getTrackColor: () => getTrackColorFromSequencer(sequencer),
      drawRoundedRect,
    });
    
    drawOverlayNotes(safeCtx, {
      previewNotes: pastePreviewNotes ?? (previewNote ? [previewNote] : null),
      hoveredNote,
      selectedNotes,
      highlightedNotes: handlerContext.getHighlightedNotes?.() ?? [],
      cellWidth,
      cellHeight,
      getPitchRow,
      getPitchClass,
      getTrackColor: () => getTrackColorFromSequencer(sequencer),
      drawRoundedRect,
    });

    // Draw the resize handles
    for (const note of selectedNotes) {
      drawResizeArrow(safeCtx, note, {
        cellWidth,
        cellHeight,
        getPitchRow,
        isHovered: note === getHoveredResizeNote()
      });
    }  

    // Draw the marquee selection
    if (handlerContext.selectionBox?.active) {
        drawMarqueeSelectionBox(safeCtx, handlerContext);
    }
  
    safeCtx.restore();
  }
  
  function zoomIn() {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      zoomIndex++;
      applyZoom();
    }
  }
  
  function zoomOut() {
    if (zoomIndex > 0) {
      zoomIndex--;
      applyZoom();
    }
  }

  function resetZoom() {
    zoomIndex = 2;
    applyZoom();
  }
  
  function applyZoom() {
    const level = ZOOM_LEVELS[zoomIndex];
    cellWidth = level.cellWidth;
    cellHeight = level.cellHeight;
    resizeAndRedraw();
  }
  
  function resizeAndRedraw() {
    const totalBeats = getTotalBeats();
    const fullWidth = totalBeats * cellWidth + labelWidth;
    const visibleNotes = midiRangeBetween(config.noteRange[1], config.noteRange[0]) + 1;
    const fullHeight = visibleNotes * cellHeight;
  
    canvas.width = fullWidth;
    canvas.height = fullHeight;
    canvas.style.width = `${fullWidth}px`;
    canvas.style.height = `${fullHeight}px`;
  
    playheadCanvas.width = fullWidth;
    playheadCanvas.height = fullHeight;
    playheadCanvas.style.width = `${fullWidth}px`;
    playheadCanvas.style.height = `${fullHeight}px`;
  
    animationCanvas.width = fullWidth;
    animationCanvas.height = fullHeight;
    animationCanvas.style.width = `${fullWidth}px`;
    animationCanvas.style.height = `${fullHeight}px`;

    if (safeAnimCtx) {
      safeAnimCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
    }

    scheduleRedraw();
  }
  
  function drawPlayheadWrapper(x: number) {
    playheadX = x;
    drawPlayhead(safePlayheadCtx, x, labelWidth, canvas.height);
  }

  initZoomControls(sequencer.container, zoomIn, zoomOut, resetZoom);

  function getPitchRow(pitch: string): number {
    const topMidi = pitchToMidi(config.noteRange[1]);
    const pitchMidi = pitchToMidi(pitch);
  
    if (topMidi === null || pitchMidi === null) {
      console.warn(`Invalid pitch encountered: ${pitch}`);
      return 0; // fallback to 0th row if something went wrong
    }
  
    return topMidi - pitchMidi;
  }

  function getPitchFromRow(row: number): string {
    const topMidi = pitchToMidi(config.noteRange[1]);
    const bottomMidi = pitchToMidi(config.noteRange[0]);
  
    if (topMidi === null || bottomMidi === null) {
      console.warn(`Invalid pitch range configured: ${config.noteRange}`);
      return 'C4'; // Fallback to a safe pitch
    }
  
    const targetMidi = topMidi - row;
    const clamped = Math.max(bottomMidi, Math.min(topMidi, targetMidi));
    return midiToPitch(clamped) ?? 'C4';
  }  

  // Refresh the global mini-contour from within this instance
  function refreshGlobalMiniContour(): void {
    const globalCanvas = document.getElementById('global-mini-contour');
    if (globalCanvas instanceof HTMLCanvasElement) {
      drawGlobalMiniContour(globalCanvas, sequencers);
    }
  }  

  let activeMouseHandler: MouseHandler | null = null;

  const handlerContext: HandlerContext = {
    sequencer,
    grid: null,
    config,
    notes,
    canvas,
    animationCtx: safeAnimCtx ?? null,
    getCellHeight: () => cellHeight,
    getCellWidth: () => cellWidth,
    getCanvasPos: (e) => getCanvasPos(canvas, e, scrollContainer, labelWidth),
    findNoteAt: (x, y) => findNoteAt(x, y, notes, getPitchRow, cellHeight, cellWidth),
    scheduleRedraw,
    getPitchFromRow,
    getPitchRow,
    getSnappedBeatFromX: (x) => getSnappedBeatFromX(x, config, () => cellWidth), 
    updatePreview: note => (previewNote = note),
    clearPreview: () => (previewNote = null),
    getSelectedNote: () => selectedNote,
    setSelectedNote: n => {
      selectedNote = n;
      selectedNotes = n ? [n] : [];
    },
    
    getSelectedNotes: () => selectedNotes,
    setSelectedNotes: ns => {
      selectedNotes = ns;
      selectedNote = ns.length === 1 ? ns[0] : null;
    },    
    setHoveredNote: n => (hoveredNote = n),
    onNotesChanged: refreshGlobalMiniContour,
  };
  
  function setMouseHandler(handler: MouseHandler | null): void {
    activeMouseHandler?.detach(canvas);
    activeMouseHandler = handler;
    activeMouseHandler?.attach(canvas);
  }  
  
  // Clear selection of notes
  function clearSelection() {
    selectedNote = null;
    selectedNotes = [];
    hoveredNote = null;
    pastePreviewNote = null;
    highlightedNotesDuringMarquee = [];
    scheduleRedraw();
  }

  // Subscribe to mode changes
  const modeHandlers: Record<EditMode, (() => void) | null> = {
    'note-placement': () => setMouseHandler(getNotePlacementHandlers(handlerContext)),
    'select': () => setMouseHandler(getSelectModeHandlers(handlerContext)),
    'none': () => setMouseHandler(null),
  };
  
  let unsubscribe = subscribeEditMode((mode: EditMode) => {
    // Reset all previews and selections
    previewNote = null;
    pastePreviewNotes = null;
    highlightedNotesDuringMarquee = [];
    handlerContext.clearPreview?.();
    handlerContext.setPastePreviewNotes?.(null);
  
    if (handlerContext.selectionBox) {
      handlerContext.selectionBox.active = false;
      handlerContext.selectionBox = null;
    }
  
    clearSelection();
  
    modeHandlers[mode]?.();
  
    scheduleRedraw();
  });

  function getSelectedNote(): Note | null {
    return selectedNote;
  }
  
  function getPreviewNote(): Note | null {
    return previewNote;
  }
  
  function getXForBeat(beat: number): number {
    return beat * cellWidth;
  }
  
  function setCursor(cursor: string): void {
    canvas.style.cursor = cursor;
  }
  
  function getSelectedNotes(): Note[] {
    return selectedNotes;
  }
  
  function setSelectedNotes(ns: Note[]): void {
    selectedNotes = ns;
    selectedNote = ns.length === 1 ? ns[0] : null;
  }
  
  function applyVelocityChange(
    targetNotes: Note[],
    mode: 'set' | 'increase' | 'decrease',
    value: number
  ): void {
    for (const note of targetNotes) {
      switch (mode) {
        case 'set':
          note.velocity = Math.max(1, Math.min(127, value));
          break;
        case 'increase':
          note.velocity = Math.max(1, Math.min(127, (note.velocity ?? 100) + value));
          break;
        case 'decrease':
          note.velocity = Math.max(1, Math.min(127, (note.velocity ?? 100) - value));
          break;
      }
    }
  
    handlerContext.onNotesChanged?.(); // Update global contour
    scheduleRedraw();
  }  

  function destroy(): void {
    unsubscribe();
    clearSelectionTracker();
  }  

  const grid: Grid = {
    canvas,
    scheduleRedraw,
    drawPlayhead: drawPlayheadWrapper,
    getSelectedNote,
    clearSelection,
    getPreviewNote,
    zoomIn,
    zoomOut,
    getXForBeat,
    setMouseHandler,
    setCursor,
    gridContext: handlerContext,
    getSelectedNotes,
    setSelectedNotes,
    destroy,
    resizeAndRedraw,
    applyVelocityChange,
  };  
  
  // Sync with current mode at init
  const currentMode = getEditMode();
  let notePlacementHandlers = null;
  let selectModeHandlers = null;

  if (currentMode === 'note-placement') {
    notePlacementHandlers = getNotePlacementHandlers(handlerContext);
    setMouseHandler(notePlacementHandlers);
  } else if (currentMode === 'select') {
    selectModeHandlers = getSelectModeHandlers(handlerContext);
    setMouseHandler(selectModeHandlers);
  } else {
    setMouseHandler(null);
  } 

  // Add a method to set the paste preview notes
  handlerContext.setPastePreviewNotes = notes => {
    pastePreviewNotes = notes;
  };

  // Add a method to get the highlighted notes during marquee selection
  let highlightedNotesDuringMarquee: Note[] = [];
  handlerContext.getHighlightedNotes = () => highlightedNotesDuringMarquee;
  handlerContext.setHighlightedNotes = (notes) => {
    highlightedNotesDuringMarquee = notes;
  };

  // Now wire up the back-reference
  handlerContext.grid = grid;
  
  return grid;
}
