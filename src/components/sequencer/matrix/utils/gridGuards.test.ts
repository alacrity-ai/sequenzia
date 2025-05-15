// src/components/sequencer/matrix/utils/gridGuards.test.ts

// npm run test -- src/components/sequencer/matrix/utils/gridGuards.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { abortIfOutOfGridBounds } from '@/components/sequencer/matrix/utils/gridGuards.js';
import { CursorState } from '@/components/sequencer/matrix/input/interfaces/CursorState.js';

vi.mock('@/shared/playback/transportService.js', () => ({
  getTotalBeats: vi.fn().mockReturnValue(64), // Mock total beats to 64 for tests
}));

describe('abortIfOutOfGridBounds', () => {
  let mockStore: { setSnappedCursorGridPosition: any; setHoveredNoteKey: any };
  let mockCursorController: { set: any };
  let requestRedraw: any;

  beforeEach(() => {
    mockStore = {
      setSnappedCursorGridPosition: vi.fn(),
      setHoveredNoteKey: vi.fn(),
    };

    mockCursorController = {
      set: vi.fn(),
    };

    requestRedraw = vi.fn();
  });

  it('should abort if snapped is null', () => {
    const result = abortIfOutOfGridBounds(null, mockStore as any, mockCursorController as any, requestRedraw);

    expect(result).toBe(true);
    expect(mockStore.setSnappedCursorGridPosition).toHaveBeenCalledWith(null);
    expect(mockStore.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(mockCursorController.set).toHaveBeenCalledWith(CursorState.Default);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should abort if snapped.x >= totalBeats', () => {
    const snapped = { x: 64, y: 10 };
    const result = abortIfOutOfGridBounds(snapped, mockStore as any, mockCursorController as any, requestRedraw);

    expect(result).toBe(true);
    expect(mockStore.setSnappedCursorGridPosition).toHaveBeenCalledWith(null);
    expect(mockStore.setHoveredNoteKey).toHaveBeenCalledWith(null);
    expect(mockCursorController.set).toHaveBeenCalledWith(CursorState.Default);
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should NOT abort if snapped.x is within bounds', () => {
    const snapped = { x: 10, y: 5 };
    const result = abortIfOutOfGridBounds(snapped, mockStore as any, mockCursorController as any, requestRedraw);

    expect(result).toBe(false);
    expect(mockStore.setSnappedCursorGridPosition).not.toHaveBeenCalled();
    expect(mockStore.setHoveredNoteKey).not.toHaveBeenCalled();
    expect(mockCursorController.set).not.toHaveBeenCalled();
    expect(requestRedraw).not.toHaveBeenCalled();
  });
});
