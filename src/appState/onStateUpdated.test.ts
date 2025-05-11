import { describe, it, expect, vi } from 'vitest';
import {
  onStateUpdated,
  notifyStateUpdated
} from './onStateUpdated';
import type { AppState } from './interfaces/AppState';

describe('onStateUpdated', () => {
  const mockState: AppState = {
    tempo: 100,
    timeSignature: [4, 4],
    totalMeasures: 16,
    sequencers: [],
    songKey: 'CM',
    snapResolution: 0.25,
    noteDuration: 1,
    isTripletMode: false,
    isDottedMode: false
  };

  it('invokes subscribed listener on state update', () => {
    const cb = vi.fn();
    onStateUpdated(cb);

    notifyStateUpdated(mockState);
    expect(cb).toHaveBeenCalledWith(mockState);
  });

  it('supports unsubscribing a listener', () => {
    const cb = vi.fn();
    const unsubscribe = onStateUpdated(cb);

    unsubscribe(); // remove before notification
    notifyStateUpdated(mockState);

    expect(cb).not.toHaveBeenCalled();
  });

  it('notifies multiple listeners independently', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    onStateUpdated(cb1);
    onStateUpdated(cb2);

    notifyStateUpdated(mockState);

    expect(cb1).toHaveBeenCalledWith(mockState);
    expect(cb2).toHaveBeenCalledWith(mockState);
  });

  it('does not call unsubscribed listeners among others', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const unsub1 = onStateUpdated(cb1);
    onStateUpdated(cb2);

    unsub1(); // unsubscribe cb1
    notifyStateUpdated(mockState);

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledWith(mockState);
  });

  it('does not call the same listener multiple times if added twice', () => {
    const cb = vi.fn();
  
    onStateUpdated(cb);
    onStateUpdated(cb); // no effect due to Set semantics
  
    notifyStateUpdated(mockState);
    expect(cb).toHaveBeenCalledTimes(1); // correct expectation
  });
});
