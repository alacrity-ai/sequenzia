import type { SnappedNotePosition } from '../interfaces/SnappedNotePosition.js';
import type { InteractionStore } from '../input/stores/InteractionStore.js';
import type { CursorController } from '../input/cursor/CursorController.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';
import { CursorState } from '../input/interfaces/CursorState.js';

/**
 * Returns true if the snapped position is out of bounds (past the end of the composition).
 * Also performs all standard abort logic: clears cursor, hover, and forces redraw.
 */
export function abortIfOutOfGridBounds(
    snapped: SnappedNotePosition | null,
    store: InteractionStore,
    cursorController: CursorController,
    requestRedraw: () => void
  ): boolean {
    if (!snapped || snapped.x >= getTotalBeats()) {
      store.setSnappedCursorGridPosition(null);
      store.setHoveredNoteKey(null);
      cursorController.set(CursorState.Default);
      requestRedraw();
      return true;
    }
    return false;
  }
  