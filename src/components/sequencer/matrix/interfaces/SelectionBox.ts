// src/components/sequencer/matrix/interfaces/SelectionBox.ts

export interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  readonly?: boolean;         // prevent updates (e.g., fixed selection)
  pixelToGrid?: boolean;      // helper flag for input-level logic
}
  