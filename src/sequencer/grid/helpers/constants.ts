// src/sequencer/grid/helpers/constants.ts
import { GridConfig } from '../../interfaces/GridConfig.js';

export const GRID_CONFIG: GridConfig = {
  cellWidth: 40,
  cellHeight: 20,
  visibleNotes: 36,
  noteRange: ['C1', 'B9'],
  currentDuration: 1,
  snapResolution: 1,
  isTripletMode: false,
  loopEnabled: false,
  useEqualTemperament: true,
};

export const labelWidth = 64 as const;

export const PITCH_COLOR_MAP: Record<string, string> = {
  'C': '#FF0000',
  'C#': '#9400D3',
  'D': '#FFFF00',
  'D#': '#FF69B4',
  'E': '#0000FF',
  'F': '#00FF00',
  'F#': '#87CEFA',
  'G': '#FFA500',
  'G#': '#800080',
  'A': '#2E8B57',
  'A#': '#FFB6C1',
  'B': '#4B0082'
};

export const SNAP_RESOLUTIONS: Record<string, string> = {
  "4": "𝅝",
  "2": "𝅗𝅥",
  "1": "𝅘𝅥",
  "0.5": "♪",
  "0.25": "♬",
  "0.125": "𝅘𝅥𝅰"
};

// Hotkeys 1–6 to change note duration
export const durationHotkeys: Record<string, number> = {
    'Digit1': 4,
    'Digit2': 2,
    'Digit3': 1,
    'Digit4': 0.5,
    'Digit5': 0.25,
    'Digit6': 0.125
  };

export const HEIGHT_RATIO = 0.15;
export const MIN_CELL_WIDTH = 100;
export const MAX_CELL_WIDTH = 300;

export interface ZoomLevel {
  cellWidth: number;
  cellHeight: number;
}

export const ZOOM_LEVELS: ZoomLevel[] = [
  { cellWidth: 20, cellHeight: 10 },
  { cellWidth: 30, cellHeight: 15 },
  { cellWidth: 40, cellHeight: 20 }, // ⬅️ default
  { cellWidth: 60, cellHeight: 25 },
  { cellWidth: 80, cellHeight: 30 }
];
