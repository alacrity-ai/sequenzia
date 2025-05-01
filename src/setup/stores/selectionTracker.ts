// setup/stores/selectionTracker.js

import type { Grid } from '../../sequencer/interfaces/Grid.js';
import { getSequencers } from '../sequencers.js';
import { Note } from '../../sequencer/interfaces/Note.js';

let activeGrid: Grid | null = null;

export function registerSelectionStart(grid: Grid): void {
  if (activeGrid && activeGrid !== grid) {
    activeGrid.clearSelection();
  }
  activeGrid = grid;
}

export function clearSelectionTracker(): void {
  activeGrid = null;
}

export function getActiveGrid(): Grid | null {
  return activeGrid;
}

/**
 * Gets information about the currently selected notes across all sequencers
 * @returns Object containing sequencerId and selectedNotes, or null if no selection
 */
export function getActiveSelection(): { sequencerId: number, selectedNotes: Note[] } | null {
  if (!activeGrid) return null;
  
  const selectedNotes = activeGrid.getSelectedNotes();
  if (!selectedNotes || selectedNotes.length === 0) return null;
  
  // Find which sequencer this grid belongs to
  const sequencers = getSequencers();
  const sequencer = sequencers.find(seq => seq.grid === activeGrid);
  
  if (!sequencer) return null;
  
  return {
    sequencerId: sequencer.id,
    selectedNotes: selectedNotes
  };
}
