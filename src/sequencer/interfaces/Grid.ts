// src/sequencer/interfaces/Grid.ts

import { HandlerContext } from './HandlerContext.js';
import { Note } from './Note.js';
import { MouseHandler } from './MouseHandler.js';

export interface NotePosition {
    pitch: string;
    start: number;
    duration: number;
}

export interface Grid {
    canvas: HTMLCanvasElement;
    scheduleRedraw: () => void;
    drawPlayhead: (x: number) => void;
    getSelectedNote: () => Note | null;
    clearSelection: () => void;
    getPreviewNote: () => Note | null;
    zoomIn: () => void;
    zoomOut: () => void;
    getXForBeat: (beat: number) => number;
    setMouseHandler: (handler: MouseHandler | null) => void;
    setCursor: (cursor: string) => void;
    gridContext: HandlerContext;
    getSelectedNotes: () => Note[];
    setSelectedNotes: (notes: Note[]) => void;
    destroy: () => void;
    resizeAndRedraw: () => void;
}
