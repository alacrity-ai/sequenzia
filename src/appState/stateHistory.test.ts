import { applyDiff } from './diffEngine/applyDiff';
import { getAppState } from './appState';
import { notifyStateUpdated } from './onStateUpdated';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import { pushDiff, undo, redo, clearHistory } from './stateHistory';
import type { Diff } from './interfaces/Diff';

import { __test__ } from './stateHistory';

// Mock dependencies
vi.mock('./diffEngine/applyDiff', async () => ({
  applyDiff: vi.fn()
}));

vi.mock('./appState', async () => ({
  getAppState: vi.fn(() => ({ mock: 'state' }))
}));

vi.mock('./onStateUpdated', async () => ({
  notifyStateUpdated: vi.fn()
}));

describe('stateHistory', () => {
  const fwd: Diff = { type: 'TEST_FORWARD', value: 1 };
  const rev: Diff = { type: 'TEST_REVERSE', value: -1 };

  beforeEach(() => {
    clearHistory();
    vi.clearAllMocks();
  });

  it('pushes a diff onto the history stack', () => {
    pushDiff({ forwardDiff: fwd, reverseDiff: rev });
    const result = undo();
    expect(result).toEqual(rev);
    expect(applyDiff).toHaveBeenCalledWith(rev);
    expect(notifyStateUpdated).toHaveBeenCalledWith(getAppState());
  });

  it('truncates future history after undo and new diff push', () => {
    pushDiff({ forwardDiff: { type: '1' }, reverseDiff: { type: 'r1' } });
    pushDiff({ forwardDiff: { type: '2' }, reverseDiff: { type: 'r2' } });
    undo(); // undo '2'
    pushDiff({ forwardDiff: { type: '3' }, reverseDiff: { type: 'r3' } }); // overwrites redo

    const result = redo();
    expect(result).toBeNull(); // redo should now fail
  });

  it('honors MAX_HISTORY_LENGTH limit', () => {
    for (let i = 0; i < 105; i++) {
      pushDiff({
        forwardDiff: { type: `f${i}` },
        reverseDiff: { type: `r${i}` }
      });
    }

    // Should be able to undo at least the last few
    for (let i = 0; i < 5; i++) undo();
    const result = undo();
    expect(result).not.toBeNull();
  });

  it('does not undo past a CHECKPOINT', () => {
    pushDiff({ forwardDiff: { type: 'a' }, reverseDiff: { type: 'ra' } });
    pushDiff({ forwardDiff: { type: 'CHECKPOINT' }, reverseDiff: { type: 'CHECKPOINT' } });
    pushDiff({ forwardDiff: { type: 'b' }, reverseDiff: { type: 'rb' } });

    const result = undo(); // should undo 'b'
    expect(result?.type).toBe('rb');
    const checkpointAttempt = undo(); // should return null
    expect(checkpointAttempt).toBeNull();
  });

  it('re-applies forwardDiff on redo()', () => {
    pushDiff({ forwardDiff: fwd, reverseDiff: rev });
    undo();
    const result = redo();
    expect(result).toEqual(fwd);
    expect(applyDiff).toHaveBeenCalledWith(fwd);
    expect(notifyStateUpdated).toHaveBeenCalledWith(getAppState());
  });

  it('clearHistory empties the stack and resets pointer', () => {
    pushDiff({ forwardDiff: fwd, reverseDiff: rev });
    clearHistory();
    const result = undo();
    expect(result).toBeNull();
  });

  describe('stateHistory – edge cases and internal logic', () => {
    const makeDiff = (id: string): Diff => ({ type: `TYPE_${id}` });
  
    beforeEach(() => {
      clearHistory();
      vi.clearAllMocks();
    });
  
    it('skips over entries without reverseDiff during undo', () => {
      pushDiff({ forwardDiff: makeDiff('A'), reverseDiff: makeDiff('REVERSE_A') });
      pushDiff({ forwardDiff: makeDiff('B'), reverseDiff: undefined as unknown as Diff }); // malformed
      pushDiff({ forwardDiff: makeDiff('C'), reverseDiff: makeDiff('REVERSE_C') });
  
      // Should undo 'C'
      let result = undo();
      expect(result?.type).toBe('TYPE_REVERSE_C');
  
      // Should skip 'B' and undo 'A'
      result = undo();
      expect(result?.type).toBe('TYPE_REVERSE_A');
    });
  
    it('redo returns null if forwardDiff is missing', () => {
        pushDiff({ forwardDiff: makeDiff('X'), reverseDiff: makeDiff('REVERSE_X') });
        undo();
      
        const redoIndex = __test__.getPointer() + 1; // should be valid
        __test__.injectEntryAt(redoIndex, {
          forwardDiff: null as unknown as Diff // simulate corruption
        });
      
        const result = redo();
        expect(result).toBeNull(); // gracefully handles corrupted forwardDiff
      });
  
    it('undo halts correctly at multiple consecutive CHECKPOINTs', () => {
      pushDiff({ forwardDiff: makeDiff('A'), reverseDiff: makeDiff('REVERSE_A') });
      pushDiff({
        forwardDiff: { type: 'CHECKPOINT' },
        reverseDiff: { type: 'CHECKPOINT' }
      });
      pushDiff({
        forwardDiff: { type: 'CHECKPOINT' },
        reverseDiff: { type: 'CHECKPOINT' }
      });
      pushDiff({ forwardDiff: makeDiff('B'), reverseDiff: makeDiff('REVERSE_B') });
  
      // Should undo 'B'
      let result = undo();
      expect(result?.type).toBe('TYPE_REVERSE_B');
  
      // Should encounter checkpoint and stop
      result = undo();
      expect(result).toBeNull();
    });
  
    it('cannot redo past the end of the history', () => {
      pushDiff({ forwardDiff: makeDiff('A'), reverseDiff: makeDiff('REVERSE_A') });
      undo();
  
      redo(); // redo once
      const result = redo(); // should be null now
      expect(result).toBeNull();
    });
  
    it('removes oldest entries when exceeding MAX_HISTORY_LENGTH', () => {
      const MAX = 100;
      for (let i = 0; i < MAX + 5; i++) {
        pushDiff({
          forwardDiff: { type: `TYPE_${i}` },
          reverseDiff: { type: `REVERSE_${i}` }
        });
      }
  
      // The earliest diffs (0-4) should be gone, undoing should never yield them
      const undoneTypes = [];
      for (let i = 0; i < MAX; i++) {
        const result = undo();
        if (result) undoneTypes.push(result.type);
      }
  
      expect(undoneTypes).not.toContain('REVERSE_0');
      expect(undoneTypes).not.toContain('REVERSE_1');
    });
  
    it('redo is invalidated after a new diff is pushed post-undo', () => {
      pushDiff({ forwardDiff: makeDiff('A'), reverseDiff: makeDiff('REVERSE_A') });
      pushDiff({ forwardDiff: makeDiff('B'), reverseDiff: makeDiff('REVERSE_B') });
  
      undo(); // undo B
      pushDiff({ forwardDiff: makeDiff('C'), reverseDiff: makeDiff('REVERSE_C') }); // overwrites redo path
  
      const result = redo();
      expect(result).toBeNull();
    });
  });
  
  
});
