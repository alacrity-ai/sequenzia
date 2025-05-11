// src/sequencer/matrix/input/interfaces/InteractionController.ts

import { InteractionMode } from './InteractionEnum.js';

export interface InteractionController {
  transitionTo: (mode: InteractionMode) => void;
  getLastMouseX: () => number;
  getLastMouseY: () => number;
}
