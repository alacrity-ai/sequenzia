// src/components/sequencer/matrix/scrollbars/ScrollbarManager.test.ts

// npm run test -- src/components/sequencer/matrix/scrollbars/ScrollbarManager.test.ts

import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { ScrollbarManager } from './ScrollbarManager';
import { createMockGridScroll } from '../__mocks__/createMockGridScroll';
import { createMockInteractionStore } from '../__mocks__/createMockInteractionStore';

// Mocks
vi.mock('./injectScrollbarStyles', () => ({
  injectScrollbarStyles: vi.fn(),
}));

vi.mock('./ScrollbarDragHandler', () => ({
  ScrollbarDragHandler: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

import { ScrollbarDragHandler } from './ScrollbarDragHandler';  // <-- important import AFTER mocking

describe('ScrollbarManager', () => {
  let container: HTMLElement;
  let gridScroll: ReturnType<typeof createMockGridScroll>;
  let interactionStore: ReturnType<typeof createMockInteractionStore>;
  let requestRedraw: ReturnType<typeof vi.fn>;
  let config: any;

  let manager: ScrollbarManager;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ width: 800, height: 600 }),
    });

    gridScroll = createMockGridScroll();
    interactionStore = createMockInteractionStore();
    requestRedraw = vi.fn();

    config = {
      layout: {
        labelWidth: 100,
        headerHeight: 50,
      },
    };

    manager = new ScrollbarManager(container, gridScroll, config, interactionStore, requestRedraw);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should create scrollbar DOM elements', () => {
    expect(container.querySelector('.grid-scrollbar')).not.toBeNull();
    expect(container.querySelector('.grid-scrollbar-thumb')).not.toBeNull();
    expect(container.querySelector('.grid-scrollbar-corner')).not.toBeNull();
  });

  it('should call ScrollbarDragHandler for horizontal and vertical thumbs', () => {
    expect(vi.mocked(ScrollbarDragHandler)).toHaveBeenCalledTimes(2);
  });

  it('should correctly update thumb sizes and positions', () => {
    vi.mocked(gridScroll.getContentWidth).mockReturnValue(2000);
    vi.mocked(gridScroll.getContentHeight).mockReturnValue(1600);
    vi.mocked(gridScroll.getX).mockReturnValue(500);
    vi.mocked(gridScroll.getY).mockReturnValue(400);
    vi.mocked(gridScroll.getMaxScrollX).mockReturnValue(1200);
    vi.mocked(gridScroll.getMaxScrollY).mockReturnValue(1000);

    manager.update();

    const hThumb = container.querySelectorAll('.grid-scrollbar-thumb')[0] as HTMLElement;
    const vThumb = container.querySelectorAll('.grid-scrollbar-thumb')[1] as HTMLElement;

    expect(hThumb.style.width).not.toBe('');
    expect(hThumb.style.left).not.toBe('');
    expect(vThumb.style.height).not.toBe('');
    expect(vThumb.style.top).not.toBe('');
  });

  it('should call destroy on drag handlers and remove DOM on destroy()', () => {
    manager.destroy();

    expect(vi.mocked(ScrollbarDragHandler).mock.results[0].value.destroy).toHaveBeenCalled();
    expect(vi.mocked(ScrollbarDragHandler).mock.results[1].value.destroy).toHaveBeenCalled();

    expect(container.querySelector('.grid-scrollbar')).toBeNull();
    expect(container.querySelector('.grid-scrollbar-thumb')).toBeNull();
    expect(container.querySelector('.grid-scrollbar-corner')).toBeNull();
  });

  it('should clamp thumb positions correctly when maxScroll is zero', () => {
    vi.mocked(gridScroll.getContentWidth).mockReturnValue(1000);
    vi.mocked(gridScroll.getContentHeight).mockReturnValue(1000);
    vi.mocked(gridScroll.getX).mockReturnValue(0);
    vi.mocked(gridScroll.getY).mockReturnValue(0);
    vi.mocked(gridScroll.getMaxScrollX).mockReturnValue(0);
    vi.mocked(gridScroll.getMaxScrollY).mockReturnValue(0);

    manager.update();

    const hThumb = container.querySelectorAll('.grid-scrollbar-thumb')[0] as HTMLElement;
    const vThumb = container.querySelectorAll('.grid-scrollbar-thumb')[1] as HTMLElement;

    expect(hThumb.style.left).toBe('0px');
    expect(vThumb.style.top).toBe('0px');
  });
});
