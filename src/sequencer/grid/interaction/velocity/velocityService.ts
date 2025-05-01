// src/sequencer/grid/interaction/velocity/velocityService.ts

import type { Note } from '../../../interfaces/Note.js';
import { getActiveGrid } from '../../../../setup/stores/selectionTracker.js';
import { showErrorModal } from '../../../../global/errorGeneric.js';
import { recordDiff } from '../../../../appState/appState.js';
import { createUpdateNoteVelocityDiff, createReverseNoteVelocityDiff } from '../../../../appState/diffEngine/types/grid/setVelocity.js';

interface VelocityChangeOptions {
  mode: 'set' | 'increase' | 'decrease' | 'none'; // now supports 'none'
  value: number;

  rampDirection?: 'up' | 'down' | 'none';
  rampAmount?: number;
  rampMode?: 'linear' | 'exponential';

  randomize?: boolean;
  randomRange?: number;
}

export function applyVelocityChange(notes: Note[], opts: VelocityChangeOptions): void {
    const grid = getActiveGrid();
  
    if (!grid) {
      console.warn('No active grid found to apply velocity changes.');
      return;
    }
  
    if (!notes || notes.length === 0) {
      console.warn('No notes provided to apply velocity changes.');
      return;
    }
  
    const beforeNotes = notes.map(n => ({ ...n }));
  
    const {
      mode,
      value,
      rampDirection = 'none',
      rampAmount = 0,
      rampMode = 'linear',
      randomize = false,
      randomRange = 0,
    } = opts;
  
    // Step 1: Decorate notes with original index
    const indexed = notes.map((note, i) => ({ note, originalIndex: i }));
  
    // Step 2: Sort by start time
    indexed.sort((a, b) => a.note.start - b.note.start);
  
    // Step 3: Apply velocity changes
    indexed.forEach(({ note }, i) => {
      let baseVelocity: number;
  
      switch (mode) {
        case 'set':
          
          baseVelocity = Math.max(1, value);
          break;
        case 'increase':
          baseVelocity = (note.velocity ?? 100) + value;
          break;
        case 'decrease':
          baseVelocity = (note.velocity ?? 100) - value;
          break;
        case 'none':
        default:
          baseVelocity = note.velocity ?? 100;
          break;
      }
  
      let delta = 0;
      if (rampDirection !== 'none' && rampAmount !== 0) {
        const t = rampMode === 'linear' ? i : Math.pow(i, 1.3);
        delta = rampAmount * t;
        if (rampDirection === 'down') {
          delta = -delta;
        }
      }
  
      let randomized = baseVelocity + delta;
      if (randomize && randomRange > 0) {
        const rand = (Math.random() * 2 - 1) * randomRange;
        randomized += rand;
      }
  
      note.velocity = Math.max(1, Math.min(127, Math.round(randomized)));
    });
  
    // Step 4: Reconstruct order for accurate diffing
    const reordered = indexed
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map(({ note }) => ({ ...note }));
  
    const afterNotes = reordered;
  
    recordDiff(
      createUpdateNoteVelocityDiff(grid.gridContext.sequencer.id, afterNotes),
      createReverseNoteVelocityDiff(grid.gridContext.sequencer.id, beforeNotes)
    );
  }
  
