// src/sequencer/matrix/scrollbars/ScrollbarManager.ts

import { ScrollbarDragHandler } from './ScrollbarDragHandler.js';
import { injectScrollbarStyles } from './injectScrollbarStyles.js';
import { InteractionStore } from '../input/stores/InteractionStore.js';
import type { GridScroll } from './GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import { TAILWIND_COLORS } from '../../../global/macros/tailwind.js';

export class ScrollbarManager {
  private hScrollbar!: HTMLDivElement;
  private hThumb!: HTMLDivElement;
  private vScrollbar!: HTMLDivElement;
  private vThumb!: HTMLDivElement;
  private corner!: HTMLDivElement;

  private hDragHandler!: ScrollbarDragHandler;
  private vDragHandler!: ScrollbarDragHandler;  

  private readonly trackThickness = 16;

  constructor(
    private container: HTMLElement,
    private scroll: GridScroll,
    private config: GridConfig,
    private interactionStore: InteractionStore,
    private requestRedraw: () => void
  ) {
    injectScrollbarStyles();
    this.createDOM();
    this.attachEvents();
    this.config = this.config;
    this.interactionStore = interactionStore;
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
  
    // Set scrollbar track dimensions
    h.style.bottom = '0';
    h.style.left = '0';
    h.style.right = `${this.trackThickness}px`;
    h.style.height = `${this.trackThickness}px`;
  
    // Set scrollbar track dimensions
    v.style.top = '0';
    v.style.right = '0';
    v.style.bottom = `${this.trackThickness}px`;
    v.style.width = `${this.trackThickness}px`;

    // Corner styling
    c.style.width = `${this.trackThickness}px`;
    c.style.height = `${this.trackThickness}px`;
    c.style.right = '0';
    c.style.bottom = '0';
    c.style.background = '#333';
    c.style.position = 'absolute';
  
    // Thumb styling and layering
    ht.style.zIndex = vt.style.zIndex = '6';
    ht.style.position = vt.style.position = 'absolute';
    ht.style.background = TAILWIND_COLORS['bg-purple-700'];
    vt.style.background = TAILWIND_COLORS['bg-purple-700'];
    ht.style.borderRadius = vt.style.borderRadius = '8px';
    ht.style.height = '100%';
    vt.style.width = '100%';

    h.appendChild(ht);
    v.appendChild(vt);
    this.container.appendChild(h);
    this.container.appendChild(v);
    this.container.appendChild(c);
  }  

  private attachEvents(): void {
    this.hDragHandler = new ScrollbarDragHandler(this.hThumb, true, this.scroll, this.interactionStore, this.requestRedraw);
    this.vDragHandler= new ScrollbarDragHandler(this.vThumb, false, this.scroll, this.interactionStore, this.requestRedraw);
  }

  public update(): void {
    const { width, height } = this.container.getBoundingClientRect();
    const totalWidth = this.scroll.getContentWidth();
    const totalHeight = this.scroll.getContentHeight();

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();
    const maxX = this.scroll.getMaxScrollX();
    const maxY = this.scroll.getMaxScrollY();    

    // Horizontal
    const hTrack = width - this.trackThickness;
    const labelWidth = this.config.layout.labelWidth;
    const hThumbWidth = Math.max(40, ((width - labelWidth) / totalWidth) * hTrack);    
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
  }

  public destroy(): void {
    this.hDragHandler.destroy();
    this.vDragHandler.destroy();

    this.hScrollbar.remove();
    this.vScrollbar.remove();
    this.corner.remove();
    this.hScrollbar = null!;
    this.vScrollbar = null!;
    this.corner = null!;
  }
}
