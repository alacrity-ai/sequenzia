// src/components/sequencer/matrix/scrollbars/ScrollbarDragHandler.test.ts

// npm run test -- src/components/sequencer/matrix/scrollbars/ScrollbarDragHandler.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScrollbarDragHandler } from '@/components/sequencer/matrix/scrollbars/ScrollbarDragHandler';
import { createMockGridScroll } from '@/components/sequencer/matrix/__mocks__/createMockGridScroll';
import { createMockInteractionStore } from '@/components/sequencer/matrix/__mocks__/createMockInteractionStore';

describe('ScrollbarDragHandler', () => {
  let thumb: HTMLDivElement;
  let track: HTMLDivElement;
  let scroll: ReturnType<typeof createMockGridScroll>;
  let interactionStore: ReturnType<typeof createMockInteractionStore>;
  let requestRedraw: ReturnType<typeof vi.fn>;
  let handler: ScrollbarDragHandler;

  beforeEach(() => {
    // Setup DOM elements
    track = document.createElement('div');
    track.style.width = '200px';
    track.style.height = '20px';
    document.body.appendChild(track);

    thumb = document.createElement('div');
    thumb.style.width = '50px';
    thumb.style.height = '20px';
    track.appendChild(thumb);

    scroll = createMockGridScroll(0, 0);
    interactionStore = createMockInteractionStore();
    requestRedraw = vi.fn();

    handler = new ScrollbarDragHandler(thumb, true, scroll, interactionStore, requestRedraw);
  });

  afterEach(() => {
    handler.destroy();
    track.remove();
  });

  it('should set isOnScrollbar true on mouseenter', () => {
    thumb.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(interactionStore.setIsOnScrollbar).toHaveBeenCalledWith(true);
  });

  it('should set isOnScrollbar false on mouseleave', () => {
    thumb.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(interactionStore.setIsOnScrollbar).toHaveBeenCalledWith(false);
  });

  it('should start scrolling on mousedown', () => {
    thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(interactionStore.setIsScrolling).toHaveBeenCalledWith(true);
  });

  it('should update scroll position on mousemove', () => {
    thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Simulate dragging halfway through track
    const event = new MouseEvent('mousemove', {
      clientX: 125, // 125px in track space
      bubbles: true
    });

    Object.defineProperty(track, 'offsetWidth', { value: 200 });
    Object.defineProperty(thumb, 'offsetWidth', { value: 50 });
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      right: 300,
      bottom: 120,
      width: 200,
      height: 20,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    document.dispatchEvent(event);

    // Scroll ratio → thumb in middle of track (after adjustments)
    expect(scroll.setScroll).toHaveBeenCalled();
    expect(requestRedraw).toHaveBeenCalled();
  });

  it('should stop scrolling on mouseup', () => {
    thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    const upEvent = new MouseEvent('mouseup', { bubbles: true });
    document.dispatchEvent(upEvent);

    expect(interactionStore.setIsScrolling).toHaveBeenCalledWith(false);
  });

  it('should clean up event listeners on destroy', () => {
    const removeEventListenerSpy = vi.spyOn(track, 'removeEventListener');
    handler.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
  });

  it('does not scroll when maxTrackTravel is zero', () => {
    thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    Object.defineProperty(track, 'offsetWidth', { value: 100 });
    Object.defineProperty(thumb, 'offsetWidth', { value: 100 }); // Equal size → maxTrackTravel = 0

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      right: 200,
      bottom: 120,
      width: 100,
      height: 20,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    const moveEvent = new MouseEvent('mousemove', { clientX: 150, bubbles: true });
    document.dispatchEvent(moveEvent);

    expect(scroll.setScroll).toHaveBeenCalledWith(0, scroll.getY());
  });

  it('handles vertical scroll updates correctly', () => {
    const verticalHandler = new ScrollbarDragHandler(thumb, false, scroll, interactionStore, requestRedraw);

    Object.defineProperty(track, 'offsetHeight', { value: 200 });
    Object.defineProperty(thumb, 'offsetHeight', { value: 50 });

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      right: 120,
      bottom: 300,
      width: 20,
      height: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    const moveEvent = new MouseEvent('mousemove', { clientY: 150, bubbles: true });
    document.dispatchEvent(moveEvent);

    expect(scroll.setScroll).toHaveBeenCalledWith(scroll.getX(), expect.any(Number));
    expect(requestRedraw).toHaveBeenCalled();

    verticalHandler.destroy();
  });

  it('removes mousemove/mouseup listeners if destroy is called mid-drag', () => {
    thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Simulate active drag
    expect(interactionStore.setIsScrolling).toHaveBeenCalledWith(true);

    const removeMoveSpy = vi.spyOn(document, 'removeEventListener');

    handler.destroy();

    expect(removeMoveSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeMoveSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
  });
});
