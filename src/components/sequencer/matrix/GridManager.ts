// src/components/sequencer/matrix/main/GridManager.ts

export class GridManager {
    public container: HTMLElement;
    public gridCanvas: HTMLCanvasElement;
    public noteCanvas: HTMLCanvasElement;
    public animationCanvas: HTMLCanvasElement;
    public playheadCanvas: HTMLCanvasElement;
    public gridCtx: CanvasRenderingContext2D;
    public noteCtx: CanvasRenderingContext2D;
    public animationCtx: CanvasRenderingContext2D;
    public playheadCtx: CanvasRenderingContext2D;
  
    constructor(parent: HTMLElement) {
      this.container = this.createContainer();
      parent.appendChild(this.container);
  
      this.gridCanvas = this.createCanvas('gridCanvas');
      this.noteCanvas = this.createCanvas('noteCanvas');
      this.animationCanvas = this.createCanvas('animationCanvas');
      this.playheadCanvas = this.createCanvas('playheadCanvas');

      this.container.appendChild(this.gridCanvas);
      this.container.appendChild(this.noteCanvas);
      this.container.appendChild(this.animationCanvas);
      this.container.appendChild(this.playheadCanvas);
  
      this.gridCtx = this.getCtx(this.gridCanvas);
      this.noteCtx = this.getCtx(this.noteCanvas);
      this.animationCtx = this.getCtx(this.animationCanvas);
      this.playheadCtx = this.getCtx(this.playheadCanvas);
  
      this.injectContainerStyles();
      this.injectCanvasStyles();
    }
  
    private createContainer(): HTMLElement {
      const div = document.createElement('div');
      div.id = 'grid-container';
      div.style.position = 'relative';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.background = '#222';
      div.style.border = '1px solid #333';
      div.style.overflow = 'hidden';
      div.style.boxShadow = '0 0 20px rgba(0,0,0,0.4)';
      div.style.borderRadius = '6px';
      return div;
    }
  
    private createCanvas(id: string): HTMLCanvasElement {
      const canvas = document.createElement('canvas');
      canvas.id = id;
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      return canvas;
    }
  
    private getCtx(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error(`2D context not available for canvas with id: ${canvas.id}`);
      return ctx;
    }
  
    private injectContainerStyles(): void {
      const style = document.createElement('style');
      style.textContent = `
        #grid-container canvas {
          z-index: 0;
        }
        #grid-container canvas#noteCanvas {
          z-index: 1;
        }
        #grid-container canvas#animationCanvas {
          z-index: 2;
        }
        #grid-container canvas#playheadCanvas {
          z-index: 3;
        }
      `;
      document.head.appendChild(style);
    }
  
    private injectCanvasStyles(): void {
      // Additional styles can be managed here if needed later
    }
  }
  