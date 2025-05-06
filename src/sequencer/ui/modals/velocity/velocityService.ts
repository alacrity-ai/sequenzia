// src/sequencer/ui/modals/velocity/velocityService.ts

import { getSequencers } from '../../../../setup/sequencers.js';
import { getActiveSelection } from '../../../utils/selectionTracker.js';
import { recordDiff } from '../../../../appState/appState.js';
import {
  createUpdateNoteVelocityDiff,
  createReverseNoteVelocityDiff
} from '../../../../appState/diffEngine/types/grid/setVelocity.js';

interface VelocityChangeOptions {
  mode: 'set' | 'increase' | 'decrease' | 'none';
  value: number;

  rampDirection?: 'up' | 'down' | 'none';
  rampAmount?: number;
  rampMode?: 'linear' | 'exponential';

  randomize?: boolean;
  randomRange?: number;
}

export function applyVelocityChange(opts: VelocityChangeOptions): void {
  const selection = getActiveSelection();

  if (!selection) {
    console.warn('No active note selection to apply velocity changes.');
    return;
  }

  const { sequencerId, selectedNotes } = selection;

  if (selectedNotes.length === 0) {
    console.warn('No notes selected in the active sequencer.');
    return;
  }

  const sequencer = getSequencers().find(seq => seq.id === sequencerId);
  if (!sequencer?.matrix) {
    console.warn(`Could not find matrix for sequencer ID ${sequencerId}.`);
    return;
  }

  const beforeNotes = selectedNotes.map(n => ({ ...n }));

  const {
    mode,
    value,
    rampDirection = 'none',
    rampAmount = 0,
    rampMode = 'linear',
    randomize = false,
    randomRange = 0,
  } = opts;

  const indexed = selectedNotes.map((note, i) => ({ note, originalIndex: i }));
  indexed.sort((a, b) => a.note.start - b.note.start);

  // Group notes by their start time
  const groupedByStart = new Map<number, { note: typeof selectedNotes[number], originalIndex: number }[]>();
  for (const item of indexed) {
    const key = item.note.start;
    if (!groupedByStart.has(key)) {
      groupedByStart.set(key, []);
    }
    groupedByStart.get(key)!.push(item);
  }

  // Sort groups by temporal order
  const sortedGroups = Array.from(groupedByStart.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, group]) => group);

  // Apply velocity changes group-wise
  sortedGroups.forEach((group, groupIndex) => {
    let t = rampMode === 'linear' ? groupIndex : Math.pow(groupIndex, 1.3);
    let delta = rampAmount * t;
    if (rampDirection === 'down') {
      delta = -delta;
    }

    for (const { note } of group) {
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

      let randomized = baseVelocity + delta;
      if (randomize && randomRange > 0) {
        const rand = (Math.random() * 2 - 1) * randomRange;
        randomized += rand;
      }

      note.velocity = Math.max(1, Math.min(127, Math.round(randomized)));
    }
  });

  const afterNotes = indexed
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map(({ note }) => ({ ...note }));

  recordDiff(
    createUpdateNoteVelocityDiff(sequencerId, afterNotes),
    createReverseNoteVelocityDiff(sequencerId, beforeNotes)
  );
}
