// src/sequencer/matrix/input/stores/InteractionStore.ts
  
import { Note } from '@/shared/interfaces/Note.js';
import { SnappedNotePosition } from '@/components/sequencer/matrix/interfaces/SnappedNotePosition.js';
import type { SelectionBox } from '@/components/sequencer/matrix/interfaces/SelectionBox.js';

export class InteractionStore {
  // ---- Cursor snap position ----
  private snappedCursorGridPosition: SnappedNotePosition | null = null;

  public setSnappedCursorGridPosition(pos: SnappedNotePosition | null): void {
    this.snappedCursorGridPosition = pos;
  }

  public getSnappedCursorGridPosition(): SnappedNotePosition | null {
    return this.snappedCursorGridPosition;
  }

  // --- Previewed Notes ---
  private previewNotes: Note[] = [];

  public setPreviewNotes(notes: Note[]): void {
    this.previewNotes = notes;
  }

  public getPreviewNotes(): Note[] {
    return this.previewNotes;
  }

  public clearPreviewNotes(): void {
    this.previewNotes = [];
  }

  // ---- Hovered note ----
  private hoveredNoteKey: string | null = null;

  public setHoveredNoteKey(key: string | null): void {
    this.hoveredNoteKey = key;
  }

  public getHoveredNoteKey(): string | null {
    return this.hoveredNoteKey;
  }

  // ---- Marquee box state ----
  private marqueeBox: SelectionBox | null = null;

  public setMarqueeBox(box: SelectionBox | null): void {
    this.marqueeBox = box;
  }

  public getMarqueeBox(): SelectionBox | null {
    return this.marqueeBox;
  }

  public hasMarquee(): boolean {
    return this.marqueeBox !== null;
  }

  // ---- Highlighted notes ----
  private highlightedNoteKeys: Set<string> = new Set();

  public setHighlightedNotes(notes: Note[]): void {
    this.highlightedNoteKeys = new Set(notes.map(n => `${n.pitch}:${n.start}`));
  }

  public clearHighlightedNotes(): void {
    this.highlightedNoteKeys.clear();
  }

  public isNoteHighlighted(note: Note): boolean {
    return this.highlightedNoteKeys.has(`${note.pitch}:${note.start}`);
  }

  // ---- Selection state ----
  private selectedNotes: Note[] = [];

  public getSelectedNotes(): Note[] {
    return this.selectedNotes;
  }

  public setSelectedNotes(notes: Note[]): void {
    this.selectedNotes = notes;
  }

  public clearSelection(): void {
    this.selectedNotes = [];
  }

  public hasSelection(): boolean {
    return this.selectedNotes.length > 0;
  }

  // ---- Drag anchor note key ----
  private dragAnchorNoteKey: string | null = null;

  public setDragAnchorNoteKey(key: string | null): void {
    this.dragAnchorNoteKey = key;
  }
  
  public getDragAnchorNoteKey(): string | null {
    return this.dragAnchorNoteKey;
  }  

  // ---- UI boundaries (scrollbars, overlays, etc.) ----
  private isOnScrollbar = false;
  private isScrolling = false;

  public setIsOnScrollbar(val: boolean): void {
    this.isOnScrollbar = val;
  }

  public getIsOnScrollbar(): boolean {
    return this.isOnScrollbar;
  }

  public setIsScrolling(val: boolean): void {
    this.isScrolling = val;
  }

  public isOnNonGridElement(): boolean {
    return this.isOnScrollbar || this.isScrolling;
  }

  // ---- Drag-to-select intent tracking ----
  private isInitiatingSelectionDrag = false;

  public beginSelectionDrag(): void {
    this.isInitiatingSelectionDrag = true;
  }

  public endSelectionDrag(): void {
    this.isInitiatingSelectionDrag = false;
  }

  public isDraggingToSelect(): boolean {
    return this.isInitiatingSelectionDrag;
  }

  // ---- Dragging selected notes (future use) ----
  private isDraggingNotes = false;

  public setIsDraggingNotes(val: boolean): void {
    this.isDraggingNotes = val;
  }

  public getIsDraggingNotes(): boolean {
    return this.isDraggingNotes;
  }

  public isActivelyDragging(): boolean {
    return this.isDraggingNotes || this.isInitiatingSelectionDrag;
  }

  // ---- Just Deleted a note
  private lastDeletionTime: number = 0;

  setLastDeletionTime(): void {
    this.lastDeletionTime = performance.now();
  }

  getLastDeletionTime(): number {
    return this.lastDeletionTime;
  }
}
