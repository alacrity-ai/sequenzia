// public onMouseMove(e: MouseEvent): void {
//   if (this.store.isOnNonGridElement()) {
//     this.store.setSnappedCursorGridPosition(null);
//     this.store.setHoveredNoteKey(null);
//     this.requestRedraw();
//     return;
//   }

//   const dx = e.clientX - this.initialMouseX;
//   const dy = e.clientY - this.initialMouseY;
//   const distance = Math.sqrt(dx * dx + dy * dy);

//   // === Handle selection drag initiated with left mouse button
//   if (e.buttons === 1 && this.store.isDraggingToSelect()) {
//     const hoveredKey = this.store.getHoveredNoteKey();

//     // Determine snapped pitch for transition guard
//     const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
//     if (!snapped) return;
//     if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;

//     const snappedPitch = rowToNote(snapped.y, this.config.layout.lowestMidi, this.config.layout.highestMidi);

//     // FAST-TRACK: Only allow sizing if hovered note matches snapped pitch
//     if (hoveredKey && distance >= this.dragThreshold) {
//       const [pitch, start] = hoveredKey.split(':');
//       if (pitch === snappedPitch) {
//         const note = this.noteManager.findAtPosition(pitch, Number(start));
//         if (note) {
//           this.store.setSelectedNotes([note]); // safe overwrite
//           this.store.endSelectionDrag();
//           this.controller.transitionTo(InteractionMode.Sizing);
//           return;
//         }
//       }
//     }
//   }

//   // === Handle marquee selection drag with right mouse button
//   if (e.buttons === 2 && this.store.isDraggingToSelect()) {
//     if (distance >= this.dragThreshold) {
//       this.store.endSelectionDrag();
//       this.controller.transitionTo(InteractionMode.Selecting);
//       return;
//     }
//   }

//   // === Snap to grid for preview placement
//   const snapped = getSnappedFromEvent(e, this.canvas, this.grid, this.scroll, this.config);
//   if (!snapped) return;
//   if (abortIfOutOfGridBounds(snapped, this.store, this.cursorController, this.requestRedraw)) return;

//   this.store.setSnappedCursorGridPosition(snapped);

//   // === Raw hover detection (bypasses snap-to-key limitation)
//   const rawMouse = getRelativeMousePos(e, this.canvas);
//   const {
//     layout: { headerHeight, baseCellWidth, verticalCellRatio, highestMidi, lowestMidi },
//     behavior: { zoom }
//   } = this.config;

//   const cellHeight = (baseCellWidth * zoom) / verticalCellRatio;
//   const totalRows = highestMidi - lowestMidi + 1;

//   let rawRowY = Math.floor((rawMouse.y + this.scroll.getY() - headerHeight) / cellHeight);
//   rawRowY = Math.max(0, Math.min(rawRowY, totalRows - 1));

//   const rawPitchMidi = highestMidi - rawRowY;
//   const rawPitchName = midiToPitch(rawPitchMidi);

//   const rawBeat = getRawBeatFromEvent(e, this.canvas, this.scroll, this.config);
//   const hoveredNote = this.noteManager.findNoteUnderCursor(rawPitchName, rawBeat);
//   const edgeNote = this.noteManager.findNoteEdgeAtCursor(rawPitchName, rawBeat);

//   // === Hover expression and cursor state
//   if (hoveredNote) {
//     const key = `${hoveredNote.pitch}:${hoveredNote.start}`;
//     this.store.setHoveredNoteKey(key);
//     this.store.setSnappedCursorGridPosition(null);

//     if (edgeNote === hoveredNote) {
//       this.cursorController.set(CursorState.ResizeHorizontal);
//     } else {
//       this.cursorController.set(CursorState.Pointer);
//     }
//   } else {
//     this.store.setHoveredNoteKey(null);
//     this.store.setSnappedCursorGridPosition(snapped);
//     this.cursorController.set(CursorState.Default);
//   }

//   this.requestRedraw();
// }
