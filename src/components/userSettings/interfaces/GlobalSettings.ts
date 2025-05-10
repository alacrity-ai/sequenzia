// src/components/userSettings/interfaces/GlobalSettings.ts

export type NoteToolFlavor = 'default' | 'express';

export interface GlobalSettings {
  noteToolMode: NoteToolFlavor;
}
