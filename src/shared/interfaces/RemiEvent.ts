// src/shared/interfaces/RemiEvent.ts

export type RemiEvent =
  | { type: 'Bar'; value: number }
  | { type: 'Position'; value: number }
  | { type: 'Pitch'; value: string }
  | { type: 'Duration'; value: number }
  | { type: 'Velocity'; value: number };
