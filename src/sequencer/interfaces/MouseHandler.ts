// src/sequencer/interfaces/MouseHandler.ts

export interface MouseHandler {
    attach: (canvas: HTMLCanvasElement) => void;
    detach: (canvas: HTMLCanvasElement) => void;
}
