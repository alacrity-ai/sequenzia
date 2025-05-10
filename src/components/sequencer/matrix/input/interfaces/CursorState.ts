// src/sequencer/matrix/input/interfaces/CursorState.ts

export enum CursorState {
  Default = 'default',
  Pointer = 'pointer',
  Crosshair = 'crosshair',
  Grabbing = 'grabbing',
  Grab = 'grab',
  ResizeHorizontal = 'ew-resize',
  ResizeVertical = 'ns-resize',
  Move = 'move',
  NotAllowed = 'not-allowed',
  Custom = 'url(cursor.png), auto' // placeholder for any custom cursor
}
  