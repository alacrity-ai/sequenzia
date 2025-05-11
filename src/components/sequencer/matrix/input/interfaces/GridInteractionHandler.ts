// src/sequencer/matrix/input/interfaces/GridInteractionHandler.ts

export interface GridInteractionHandler {
  onEnter?(): void;
  onExit?(): void;
  onMouseDown?(e: MouseEvent): void;
  onMouseMove?(e: MouseEvent): void;
  onMouseUp?(e: MouseEvent): void;
  onContextMenu?(e: MouseEvent): void;
  onMouseLeave?(): void;
  onMouseEnter?(e: MouseEvent): void;
  onKeyDown?(e: KeyboardEvent): void;
}
