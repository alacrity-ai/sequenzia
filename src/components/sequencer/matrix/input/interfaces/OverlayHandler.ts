// src/sequencer/matrix/input/interfaces/OverlayHandler.ts

export interface OverlayHandler {
  onMouseMove?(e: MouseEvent): boolean;
  onMouseDown?(e: MouseEvent): boolean;
  onMouseUp?(e: MouseEvent): boolean;
  onContextMenu?(e: MouseEvent): boolean;
  onMouseLeave?(): boolean;
  onMouseEnter?(e: MouseEvent): boolean;
  onKeyDown?(e: KeyboardEvent): boolean;
  destroy?(): void;
}
