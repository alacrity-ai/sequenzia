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
import { bindMouseEvents } from './grid/interaction/mouse-handlers.js';
import { drawGlobalMiniContour } from './mini-contour.js';
import { sequencers } from '../setup/sequencers.js'; 
import { getTotalBeats } from '../helpers.js';
import { initZoomControls } from './grid/interaction/zoom-controls.js';

export function initGrid(canvas, playheadCanvas, scrollContainer, notes, config, sequencer) {
  let previewNote = null;
  let hoveredNote = null;
  let selectedNote = null;
  let scrollX = 0;
  let scrollY = 0;
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

  // Handle scroll
  scrollContainer.addEventListener('scroll', () => {
    scrollX = scrollContainer.scrollLeft;
    scrollY = scrollContainer.scrollTop;
    scheduleRedraw();
  });

  let frameId = null;
  function scheduleRedraw() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(drawGrid);
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-scrollX + labelWidth, -scrollY);

    drawGridBackground(ctx, config, scrollX, scrollY, visibleNotes, cellWidth, cellHeight, getPitchFromRow);

    drawNotes(ctx, notes, {
      previewNote,
      hoveredNote,
      selectedNote,
      cellWidth,
      cellHeight,
      visibleStartBeat: scrollX / cellWidth,
      visibleEndBeat: (scrollX + canvas.width) / cellWidth,
      getPitchRow,
      getPitchClass,
      PITCH_COLOR_MAP,
      drawRoundedRect,
    });

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
    drawPlayhead(playheadCtx, x, scrollX, scrollY, labelWidth, canvas.height);
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

  // Bind all event listeners
  bindMouseEvents(canvas, {
    sequencer,
    config,
    notes,
    getCellWidth: () => cellWidth,
    getCellHeight: () => cellHeight,
    getCanvasPos: (e) => getCanvasPos(canvas, e, scrollContainer, labelWidth),
    findNoteAt: (x, y) => findNoteAt(x, y, notes, getPitchRow, cellHeight, cellWidth),
    scheduleRedraw,
    getPitchFromRow,
    getSnappedBeatFromX: (x) => getSnappedBeatFromX(x, config, () => cellWidth),
    getRawBeatFromX: (x) => getRawBeatFromX(x, () => cellWidth),    
    updatePreview: note => (previewNote = note),
    clearPreview: () => (previewNote = null),
    getSelectedNote: () => selectedNote,
    setSelectedNote: n => (selectedNote = n),
    getHoveredNote: () => hoveredNote,
    setHoveredNote: n => (hoveredNote = n),
    onNotesChanged: refreshGlobalMiniContour
  });  

  return {
    scheduleRedraw,
    drawPlayhead: drawPlayheadWrapper,
    getSelectedNote: () => selectedNote,
    clearSelection: () => { selectedNote = null; scheduleRedraw(); },
    getPreviewNote: () => previewNote,
    zoomIn,
    zoomOut,
    getXForBeat: beat => beat * cellWidth,
  };
}
