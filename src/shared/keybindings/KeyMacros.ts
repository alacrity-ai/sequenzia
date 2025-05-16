// src/shared/keybindings/KeyMacros.ts

import type { KeyMacroName } from '@/shared/keybindings/KeyMacroDefinitions';

export const KeyMacros: Record<KeyMacroName, string | string[]> = {
  Undo: ['Control+KeyZ', 'Meta+KeyZ'],
  Redo: ['Control+KeyY', 'Meta+KeyY'],
  PasteNotes: ['Control+KeyV', 'Meta+KeyV'],
  CopyNotes: ['Control+KeyC', 'Meta+KeyC'],
  CutNotes: ['Control+KeyX', 'Meta+KeyX'],
  DeleteNotes: 'Delete',
  ToggleVelocityTool: 'KeyV',
  GridSnapOverride: ['ControlLeft', 'ControlRight'],
  TransportPlayStop: 'Space',
  TransportPlay: 'Space',
  TransportStop: 'Shift+Space',
  SeekBackward: 'Shift+KeyA',
  SeekForward: 'Shift+KeyD',
  SeekMeasureBack: 'Shift+KeyS',
  SeekMeasureForward: 'Shift+KeyW',
  ApplyDuration1: 'Digit1',
  ApplyDuration2: 'Digit2',
  ApplyDuration3: 'Digit3',
  ApplyDuration4: 'Digit4',
  ApplyDuration5: 'Digit5',
  ApplyDuration6: 'Digit6',
  ApplySnap1: 'Shift+Digit1',
  ApplySnap2: 'Shift+Digit2',
  ApplySnap3: 'Shift+Digit3',
  ApplySnap4: 'Shift+Digit4',
  ApplySnap5: 'Shift+Digit5',
  ApplySnap6: 'Shift+Digit6',
  ToggleDottedNotes: 'Period',
  ToggleTripletNotes: 'Slash',
  AIStartAutocomplete: 'KeyG',
  ToggleAIMode: 'Shift+KeyG',
  ApproveAutocomplete: 'Tab',
  SwitchToNoteMode: 'KeyQ',
  SwitchToAIMode: 'KeyW',
};

export function updateKeyMacroBinding(macroName: KeyMacroName, combo: string | string[]): void {
  KeyMacros[macroName] = combo;
}