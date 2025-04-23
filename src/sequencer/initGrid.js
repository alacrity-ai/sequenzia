import { labelWidth, PITCH_COLOR_MAP } from './grid/constants.js';
import {
  pitchToMidi, midiToPitch, getPitchClass, getRawBeatFromX, getSnappedBeatFromX
} from './grid/geometry.js';
import { drawRoundedRect } from './grid/drawing/rounded-rect.js';
import { drawGridBackground } from './grid/drawing/grid-background.js';
import { drawNotes } from './grid/drawing/note-renderer.js';
import { drawPlayhead } from './grid/drawing/playhead-renderer.js';
import { getCanvasPos } from './grid/interaction/canvas-coords.js';
import { findNoteAt } from './grid/interaction/note-finder.js';
import { drawGlobalMiniContour } from './mini-contour.js';
import { sequencers } from '../setup/sequencers.js'; 
import { getTotalBeats } from '../helpers.js';
import { initZoomControls } from './grid/interaction/zoom-controls.js';
import { getNotePlacementHandlers } from './grid/interaction/mouse-handlers.js';
import { getSelectModeHandlers } from './grid/interaction/select-handlers.js';
import { subscribeEditMode, getEditMode } from '../setup/editModeStore.js';
import { clearSelectionTracker } from '../setup/selectionTracker.js';
import { drawMarqueeSelectionBox } from './grid/drawing/selection-box.js';

export function initGrid(canvas, playheadCanvas, scrollContainer, notes, config, sequencer) {
  let previewNote = null;
  let pastePreviewNote = null;
  let pastePreviewNotes = null;
  let hoveredNote = null;
  let selectedNote = null;

  let playheadX = null;

  const ZOOM_LEVELS = [
    { cellWidth: 20, cellHeight: 10 },
    { cellWidth: 30, cellHeight: 15 },
    { cellWidth: 40, cellHeight: 20 }, // ⬅️ default
    { cellWidth: 50, cellHeight: 25 },
    { cellWidth: 60, cellHeight: 30 }
  ];
  
  let zoomIndex = 2; // start at default level  

  const ctx = canvas.getContext('2d');
  const playheadCtx = playheadCanvas.getContext('2d');

  let cellWidth = ZOOM_LEVELS[zoomIndex].cellWidth;
  let cellHeight = ZOOM_LEVELS[zoomIndex].cellHeight;  

  const visibleNotes = pitchToMidi(config.noteRange[1]) - pitchToMidi(config.noteRange[0]) + 1;
  const fullHeight = visibleNotes * cellHeight;
  const totalBeats = getTotalBeats(config);  
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

  let frameId = null;
  function scheduleRedraw() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(drawGrid);
  }

  function drawGrid() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Translate the canvas for the note label (piano roll)
    ctx.translate(labelWidth, 0);

    // Draw the grid itself
    drawGridBackground(ctx, config, visibleNotes, cellWidth, cellHeight, getPitchFromRow);

    // Draw the notes on the grid
    drawNotes(ctx, notes, {
        previewNotes: pastePreviewNotes ?? (previewNote ? [previewNote] : null),
        hoveredNote,
        selectedNote,
        selectedNotes,
        highlightedNotes: handlerContext.getHighlightedNotes(),
        cellWidth,
        cellHeight,
        visibleStartBeat: 0,
        visibleEndBeat: canvas.width / cellWidth,
        getPitchRow,
        getPitchClass,
        PITCH_COLOR_MAP,
        drawRoundedRect,
    });
      
    // Draw the marquee selection
    if (handlerContext.selectionBox?.active) {
        drawMarqueeSelectionBox(ctx, handlerContext);
    }
  
    ctx.restore();
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
    const totalBeats = getTotalBeats(config);
    const fullWidth = totalBeats * cellWidth + labelWidth;
    const visibleNotes = pitchToMidi(config.noteRange[1]) - pitchToMidi(config.noteRange[0]) + 1;
    const fullHeight = visibleNotes * cellHeight;
  
    canvas.width = fullWidth;
    canvas.height = fullHeight;
    canvas.style.width = `${fullWidth}px`;
    canvas.style.height = `${fullHeight}px`;
  
    playheadCanvas.width = fullWidth;
    playheadCanvas.height = fullHeight;
    playheadCanvas.style.width = `${fullWidth}px`;
    playheadCanvas.style.height = `${fullHeight}px`;
  
    scheduleRedraw();
  }
  
  function drawPlayheadWrapper(x) {
    playheadX = x;
    drawPlayhead(playheadCtx, x, labelWidth, canvas.height);
  }

  initZoomControls(sequencer.container, zoomIn, zoomOut, resetZoom);

  function getPitchRow(pitch) {
    return pitchToMidi(config.noteRange[1]) - pitchToMidi(pitch);
  }

  function getPitchFromRow(row) {
    const top = pitchToMidi(config.noteRange[1]);
    const targetMidi = top - row;
    const clamped = Math.max(pitchToMidi(config.noteRange[0]), Math.min(pitchToMidi(config.noteRange[1]), targetMidi));
    return midiToPitch(clamped);
  }

  // ✅ Refresh the global mini-contour from within this instance
  function refreshGlobalMiniContour() {
    const globalCanvas = document.getElementById('global-mini-contour');
    if (globalCanvas) {
      drawGlobalMiniContour(globalCanvas, sequencers);
    }
  }

  let activeMouseHandler = null;
  let selectedNotes = [];

  const handlerContext = {
    sequencer,
    grid: null,
    config,
    notes,
    getCellHeight: () => cellHeight,
    getCanvasPos: (e) => getCanvasPos(canvas, e, scrollContainer, labelWidth),
    findNoteAt: (x, y) => findNoteAt(x, y, notes, getPitchRow, cellHeight, cellWidth),
    scheduleRedraw,
    getPitchFromRow,
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
    onNotesChanged: refreshGlobalMiniContour
  };
  
  function setMouseHandler(handler) {
    if (activeMouseHandler) activeMouseHandler.detach(canvas);
    activeMouseHandler = handler;
    if (activeMouseHandler) activeMouseHandler.attach(canvas);
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
  
  // Sync with current mode at init
  const currentMode = getEditMode();
  if (currentMode === 'note-placement') {
    setMouseHandler(getNotePlacementHandlers(handlerContext));
  } else if (currentMode === 'select') {
    setMouseHandler(getSelectModeHandlers(handlerContext));
  } else {
    setMouseHandler(null);
  }

 // Subscribe to mode changes
 let unsubscribe = subscribeEditMode(mode => {
    // Clear previews
    previewNote = null;
    pastePreviewNotes = null;
    highlightedNotesDuringMarquee = [];
    handlerContext.clearPreview?.();
    handlerContext.setPastePreviewNotes?.(null);
  
    // Clear any in-progress selectionBox
    if (handlerContext.selectionBox) {
        handlerContext.selectionBox.active = false;
        handlerContext.selectionBox = null;
    }

    // Clear selection
    clearSelection();
  
    // Set interaction handler
    if (mode === 'note-placement') {
      setMouseHandler(getNotePlacementHandlers(handlerContext));
    } else if (mode === 'select') {
      setMouseHandler(getSelectModeHandlers(handlerContext));
    } else {
      setMouseHandler(null);
    }
  
    // Full redraw
    scheduleRedraw();
  });  

  const grid = {
    canvas,
    scheduleRedraw,
    drawPlayhead: drawPlayheadWrapper,
    getSelectedNote: () => selectedNote,
    clearSelection,
    getPreviewNote: () => previewNote,
    zoomIn,
    zoomOut,
    getXForBeat: beat => beat * cellWidth,
    setMouseHandler,
    setCursor: (cursor) => { canvas.style.cursor = cursor; },
    gridContext: handlerContext,
    getSelectedNotes: () => selectedNotes,
    setSelectedNotes: ns => {
      selectedNotes = ns;
      selectedNote = ns.length === 1 ? ns[0] : null;
    },
    destroy() {
      unsubscribe();
      clearSelectionTracker();
    }
  };
  
  // Add a method to set the paste preview notes
  handlerContext.setPastePreviewNotes = notes => {
    pastePreviewNotes = notes;
  };

  // Add a method to get the highlighted notes during marquee selection
  let highlightedNotesDuringMarquee = [];
  handlerContext.getHighlightedNotes = () => highlightedNotesDuringMarquee;
  handlerContext.setHighlightedNotes = (notes) => {
    highlightedNotesDuringMarquee = notes;
  };

  // ✅ Now wire up the back-reference
  handlerContext.grid = grid;
  
  return grid;
}
