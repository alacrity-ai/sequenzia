// src/sequencer/matrix/input/cursor/CursorController.ts

import { CursorState } from '../interfaces/CursorState.js';

export class CursorController {
  private current: CursorState = CursorState.Default;
  private readonly canvas: HTMLElement;

  constructor(canvas: HTMLElement) {
    this.canvas = canvas;
  }

  public set(cursor: CursorState): void {
    if (this.current !== cursor) {
      this.canvas.style.cursor = cursor;
      this.current = cursor;
    }
  }

  public reset(): void {
    this.set(CursorState.Default);
  }
}