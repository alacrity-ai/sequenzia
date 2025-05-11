// src/components/sequencer/matrix/renderers/CanvasManager.ts

export class CanvasManager {
    private dpr: number;
    private ctx: CanvasRenderingContext2D;
  
    constructor(
      public readonly canvas: HTMLCanvasElement,
      useHiDPI: boolean = true
    ) {
      this.dpr = useHiDPI ? window.devicePixelRatio || 1 : 1;
  
      const context = this.canvas.getContext('2d');
      if (!context) throw new Error('Failed to get 2D context');
      this.ctx = context;
    }
  
    /**
     * Resizes the canvas buffer to match its layout size.
     * Applies device pixel ratio scaling if enabled.
     */
    public resize(): void {
      const layoutWidth = this.canvas.offsetWidth;
      const layoutHeight = this.canvas.offsetHeight;
  
      const bufferWidth = Math.floor(layoutWidth * this.dpr);
      const bufferHeight = Math.floor(layoutHeight * this.dpr);
  
      if (this.canvas.width !== bufferWidth || this.canvas.height !== bufferHeight) {
        this.canvas.width = bufferWidth;
        this.canvas.height = bufferHeight;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        this.ctx.scale(this.dpr, this.dpr); // apply logical scaling
      }
    }
  
    /**
     * Returns the 2D context, already scaled for HiDPI.
     */
    public getContext(): CanvasRenderingContext2D {
      return this.ctx;
    }
  
    /**
     * Optionally wraps drawing logic for convenience.
     */
    public withContext(drawFn: (ctx: CanvasRenderingContext2D) => void): void {
      drawFn(this.ctx);
    }
  
    /**
     * Clears the entire canvas (logical space).
     */
    public clear(): void {
      this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    }

    public destroy(): void {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = 0;
      this.canvas.height = 0;
      // Remove the canvas from the DOM if you're sure it's unused
      if (this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }    
  }
  
  