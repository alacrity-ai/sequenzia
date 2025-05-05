// src/sequencer/matrix/input/handlers/PastingToolHandler.ts

import type { GridInteractionHandler } from '../interfaces/GridInteractionHandler.js';
import type { GridSnappingContext } from '../../interfaces/GridSnappingContext.js';
import type { GridScroll } from '../../scrollbars/GridScroll.js';
import type { GridConfig } from '../../interfaces/GridConfigTypes.js';
import type { Clipboard } from '../../../interfaces/Clipboard.js';
import type { Note } from '../../../interfaces/Note.js';
import type { InteractionStore } from '../stores/InteractionStore.js';
import type { InteractionController } from '../interfaces/InteractionController.js';
import type { CursorController } from '../cursor/CursorController.js';

import { InteractionMode } from '../interfaces/InteractionEnum.js';
import { CursorState } from '../interfaces/CursorState.js';
import { midiToPitch, noteToMidi } from '../../utils/noteUtils.js';
import { getRelativeMousePos } from '../../utils/gridPosition.js';
import { getSnappedNotePosition } from '../../utils/snapPosition.js';
import { createPlaceNotesDiff, createReversePlaceNotesDiff } from '../../../../appState/diffEngine/types/grid/placeNotes.js';
import { recordDiff } from '../../../../appState/appState.js';

export class PastingToolHandler implements GridInteractionHandler {
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: GridConfig,
    private readonly scroll: GridScroll,
    private readonly store: InteractionStore,
    private readonly grid: GridSnappingContext,
    private readonly requestRedraw: () => void,
    private readonly getSequencerId: () => number,
    private readonly controller: InteractionController,
    private readonly cursorController: CursorController,
    private readonly getClipboard: () => Clipboard,
    private readonly addNote: (note: Note) => void
  ) {}

  public onMouseMove(e: MouseEvent): void {
    const mouse = getRelativeMousePos(e, this.canvas);
    const snap = this.grid.getSnapResolution();
    const triplet = this.grid.isTripletMode();
    const snapped = getSnappedNotePosition(mouse, this.scroll, this.config, snap, triplet);
    if (!snapped) return;
  
    const clipboard = this.getClipboard();
    if (!clipboard.notes.length) return;
  
    const { lowestMidi, highestMidi } = this.config.layout;
    const totalRows = highestMidi - lowestMidi + 1;
  
    // Convert snapped.y to MIDI (grid rows are top-to-bottom inverted)
    const targetMidi = lowestMidi + (totalRows - 1 - snapped.y);
    const targetBeat = snapped.x;
  
    const deltaBeats = targetBeat - clipboard.anchorBeat;
    const deltaMidi = targetMidi - clipboard.anchorMidi;
  
    const preview = clipboard.notes.flatMap(n => {
      const sourceMidi = noteToMidi(n.pitch);
      if (sourceMidi == null) return [];
  
      const pastedMidi = sourceMidi + deltaMidi;
      const pastedPitch = midiToPitch(pastedMidi);
      if (!pastedPitch) return [];
  
      return [{
        pitch: pastedPitch,
        start: n.start + deltaBeats,
        duration: n.duration,
        velocity: n.velocity ?? 100
      }];
    });
  
    this.store.setPreviewNotes(preview);
    this.cursorController.set(CursorState.Pointer);
    this.requestRedraw();
  }   

  public onMouseDown(e: MouseEvent): void {
    if (e.button !== 0 || this.store.isOnNonGridElement()) return;
  
    const notes = this.store.getPreviewNotes();
    if (!notes.length) return;
  
    recordDiff(
      createPlaceNotesDiff(this.getSequencerId(), notes),
      createReversePlaceNotesDiff(this.getSequencerId(), notes)
    );
  
    this.store.clearPreviewNotes();
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }  

  public onMouseLeave(): void {
    this.store.clearPreviewNotes();
    this.controller.transitionTo(InteractionMode.DefaultNoteTool);
  }  

  public onExit(): void {
    this.store.clearPreviewNotes();
    this.requestRedraw();
  }  
}
