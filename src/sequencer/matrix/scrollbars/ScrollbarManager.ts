// src/sequencer/matrix/scrollbars/ScrollbarManager.ts

import { ScrollbarDragHandler } from './ScrollbarDragHandler.js';
import { injectScrollbarStyles } from './injectScrollbarStyles.js';
import type { GridScroll } from './GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';

export class ScrollbarManager {
  private hScrollbar!: HTMLDivElement;
  private hThumb!: HTMLDivElement;
  private vScrollbar!: HTMLDivElement;
  private vThumb!: HTMLDivElement;
  private corner!: HTMLDivElement;

  private readonly trackThickness = 12;

  constructor(
    private container: HTMLElement,
    private scroll: GridScroll,
    private config: GridConfig,
    private requestRedraw: () => void
  ) {
    injectScrollbarStyles();
    this.createDOM();
    this.attachEvents();
  }

  private createDOM(): void {
    const h = this.hScrollbar = document.createElement('div');
    const ht = this.hThumb = document.createElement('div');
    const v = this.vScrollbar = document.createElement('div');
    const vt = this.vThumb = document.createElement('div');
    const c = this.corner = document.createElement('div');
  
    h.className = 'grid-scrollbar';
    v.className = 'grid-scrollbar';
    ht.className = 'grid-scrollbar-thumb';
    vt.className = 'grid-scrollbar-thumb';
    c.className = 'grid-scrollbar-corner';    
  
    // Set scrollbar track styles
    h.style.position = v.style.position = c.style.position = 'absolute';
    h.style.zIndex = v.style.zIndex = c.style.zIndex = '5';
  
    h.style.bottom = '0';
    h.style.left = '0';
    h.style.right = `${this.trackThickness}px`;
    h.style.height = `${this.trackThickness}px`;
  
    v.style.top = '0';
    v.style.right = '0';
    v.style.bottom = `${this.trackThickness}px`;
    v.style.width = `${this.trackThickness}px`;
  
    c.style.width = `${this.trackThickness}px`;
    c.style.height = `${this.trackThickness}px`;
    c.style.right = '0';
    c.style.bottom = '0';
    c.style.background = '#333';
    c.style.position = 'absolute';
  
    // Thumb styling and layering
    ht.style.zIndex = vt.style.zIndex = '6';
    ht.style.position = vt.style.position = 'absolute';
    ht.style.background = 'rgba(255, 255, 255, 0.5)';
    vt.style.background = 'rgba(255, 255, 255, 0.5)';
    ht.style.borderRadius = vt.style.borderRadius = '3px';
    ht.style.height = '100%';
    vt.style.width = '100%';

    h.appendChild(ht);
    v.appendChild(vt);
    this.container.appendChild(h);
    this.container.appendChild(v);
    this.container.appendChild(c);
  }  

  private attachEvents(): void {
    new ScrollbarDragHandler(this.hThumb, true, this.scroll, this.requestRedraw);
    new ScrollbarDragHandler(this.vThumb, false, this.scroll, this.requestRedraw);
  }

  public update(): void {
    const { width, height } = this.container.getBoundingClientRect();
    const totalWidth = this.scroll.getContentWidth();
    const totalHeight = this.scroll.getContentHeight();

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();
    const maxX = this.scroll.getMaxScrollX();
    const maxY = this.scroll.getMaxScrollY();    

    console.log('[ScrollbarManager] update():', {
        width, height, totalWidth, totalHeight, scrollX, scrollY, maxX, maxY
      });

    // Horizontal
    const hTrack = width - this.trackThickness;
    const hThumbWidth = Math.max(40, (width / totalWidth) * hTrack);
    const hLeft = (scrollX / maxX) * (hTrack - hThumbWidth);
    this.hThumb.style.width = `${hThumbWidth}px`;
    this.hThumb.style.left = `${Math.max(0, hLeft)}px`;

    // Vertical
    const vTrack = height - this.trackThickness;
    const headerHeight = this.config.layout.headerHeight;
    const vThumbHeight = Math.max(40, ((height - headerHeight) / totalHeight) * vTrack);
    const vTop = (scrollY / maxY) * (vTrack - vThumbHeight);
    this.vThumb.style.height = `${vThumbHeight}px`;
    this.vThumb.style.top = `${Math.max(0, vTop)}px`;

    console.log('H Thumb Style:', this.hThumb.style.cssText);
    console.log('V Thumb Style:', this.vThumb.style.cssText);

  }

  public destroy(): void {
    this.hScrollbar.remove();
    this.vScrollbar.remove();
    this.corner.remove();
  }
}
