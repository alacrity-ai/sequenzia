// src/components/sequencer/matrix/events/EventEmitter.test.ts

// npm run test -- src/components/sequencer/matrix/events/EventEmitter.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from './EventEmitter';

type TestEvents = {
  foo: string;
  bar: number;
};

describe('EventEmitter', () => {
  let emitter: EventEmitter<TestEvents>;

  beforeEach(() => {
    emitter = new EventEmitter<TestEvents>();
  });

  it('registers and invokes listeners on emit', () => {
    const fooHandler = vi.fn();
    const barHandler = vi.fn();

    emitter.on('foo', fooHandler);
    emitter.on('bar', barHandler);

    emitter.emit('foo', 'hello');
    emitter.emit('bar', 42);

    expect(fooHandler).toHaveBeenCalledWith('hello');
    expect(barHandler).toHaveBeenCalledWith(42);
  });

  it('removes listeners via off()', () => {
    const fooHandler = vi.fn();

    emitter.on('foo', fooHandler);
    emitter.emit('foo', 'before off');
    expect(fooHandler).toHaveBeenCalledTimes(1);

    emitter.off('foo', fooHandler);
    emitter.emit('foo', 'after off');
    expect(fooHandler).toHaveBeenCalledTimes(1); // No further calls
  });

  it('clear() removes all listeners for a specific event', () => {
    const fooHandler1 = vi.fn();
    const fooHandler2 = vi.fn();

    emitter.on('foo', fooHandler1);
    emitter.on('foo', fooHandler2);

    emitter.emit('foo', 'before clear');
    expect(fooHandler1).toHaveBeenCalledTimes(1);
    expect(fooHandler2).toHaveBeenCalledTimes(1);

    emitter.clear('foo');

    emitter.emit('foo', 'after clear');
    expect(fooHandler1).toHaveBeenCalledTimes(1);
    expect(fooHandler2).toHaveBeenCalledTimes(1);
  });

  it('removeAllListeners() clears all events', () => {
    const fooHandler = vi.fn();
    const barHandler = vi.fn();

    emitter.on('foo', fooHandler);
    emitter.on('bar', barHandler);

    emitter.emit('foo', 'before clear');
    emitter.emit('bar', 123);
    expect(fooHandler).toHaveBeenCalledTimes(1);
    expect(barHandler).toHaveBeenCalledTimes(1);

    emitter.removeAllListeners();

    emitter.emit('foo', 'after clear');
    emitter.emit('bar', 456);
    expect(fooHandler).toHaveBeenCalledTimes(1);
    expect(barHandler).toHaveBeenCalledTimes(1);
  });

  it('does nothing if off() is called on unregistered listener', () => {
    const fooHandler = vi.fn();

    // No .on() call here
    emitter.off('foo', fooHandler); // Should not throw

    emitter.emit('foo', 'should do nothing');
    expect(fooHandler).toHaveBeenCalledTimes(0);
  });

  it('does nothing if clear() is called on empty event', () => {
    emitter.clear('foo'); // Should not throw
    emitter.emit('foo', 'should do nothing'); // Still safe
  });
});
