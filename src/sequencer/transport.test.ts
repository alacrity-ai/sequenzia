// src/sequencer/transport.test.ts

// Mock AudioContext globally before anything else
// Mock requestAnimationFrame to fire immediately in tests
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0);
(globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);


import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as transport from './transport';

describe('transport.ts', () => {
  beforeEach(() => {
    // Reset any transport running state before each test
    transport.stopTransport();
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Clean up spies after each test
  });

  it('should correctly set and get the current beat', () => {
    transport.setCurrentBeat(5.5);
    expect(transport.getCurrentBeat()).toBe(5.5);
  });

  it('should calculate total beats correctly', () => {
    vi.spyOn(transport, 'getTotalMeasures').mockReturnValue(8);
    vi.spyOn(transport, 'getTimeSignature').mockReturnValue(4);
    expect(transport.getTotalBeats()).toBe(32);
  });

  it('should update tempo correctly when not recording', () => {
    transport.updateTempo(120, false); // no record
    expect(Math.round(transport.getTempo())).toBe(120);
  });

  it('should update time signature correctly when not recording', () => {
    transport.updateTimeSignature(3, false); // 3 beats per measure
    expect(transport.getTimeSignature()).toBe(3);
  });

  it('should update total measures correctly when not recording', () => {
    transport.updateTotalMeasures(16, false); // 16 measures
    expect(transport.getTotalMeasures()).toBe(16);
  });

  it('should detect if transport is running', () => {
    expect(transport.isTransportRunning()).toBe(false);
    transport.startTransport(120); // should start
    expect(transport.isTransportRunning()).toBe(true);
    transport.stopTransport();
    expect(transport.isTransportRunning()).toBe(false);
  });

  it('should call onEndCallback when transport ends without looping', async () => {
    const onEnd = vi.fn();
    transport.onTransportEnd(onEnd);

    transport.startTransport(120, { endBeat: 0.0001 }); // almost immediate end
    await new Promise(resolve => setTimeout(resolve, 50)); // wait a bit
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('should call onLoop if looping is enabled', async () => {
    const onLoop = vi.fn();

    transport.startTransport(120, { loop: true, endBeat: 0.001, onLoop });
    await new Promise(resolve => setTimeout(resolve, 100)); // let it loop once or twice
    expect(onLoop).toHaveBeenCalled();
    transport.stopTransport();
  });

  it('should correctly register and unregister beat listeners', () => {
    const mockListener = vi.fn();
    const unsubscribe = transport.onBeatUpdate(mockListener);

    transport.setCurrentBeat(10);
    transport.onBeatUpdate((beat) => {
      expect(beat).toBeGreaterThanOrEqual(0);
    });

    expect(typeof unsubscribe).toBe('function');

    unsubscribe(); // Remove the listener
    transport.setCurrentBeat(20);
    expect(mockListener).not.toHaveBeenCalledWith(20); // no longer called after unsubscribe
  });
});
