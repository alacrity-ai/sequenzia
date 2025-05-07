// src/userconfig/interfaces/InteractionSettings.ts
export type NoteToolFlavor = 'default' | 'express';

export interface InteractionSettings {
  noteToolMode: NoteToolFlavor;
}
