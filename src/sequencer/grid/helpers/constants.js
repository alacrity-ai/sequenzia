export const labelWidth = 64;

export const PITCH_COLOR_MAP = {
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

export const HEIGHT_RATIO = 0.15;
export const MIN_CELL_WIDTH = 100;
export const MAX_CELL_WIDTH = 300;

export const ZOOM_LEVELS = [
  { cellWidth: 20, cellHeight: 10 },
  { cellWidth: 30, cellHeight: 15 },
  { cellWidth: 40, cellHeight: 20 }, // ⬅️ default
  { cellWidth: 50, cellHeight: 25 },
  { cellWidth: 60, cellHeight: 30 }
];