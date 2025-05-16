// src/shared/keybindings/KeyMacroBindings.ts

import type { KeyMacroName } from './interfaces/KeyMacroDefinitions';
import type { KeyMacroBinding } from './interfaces/KeyMacroBinding';

export const DefaultKeyMacros: Record<KeyMacroName, KeyMacroBinding | KeyMacroBinding[]> = {
  Undo: [{ code: 'KeyZ', ctrl: true }, { code: 'KeyZ', meta: true }],
  Redo: [{ code: 'KeyY', ctrl: true }, { code: 'KeyY', meta: true }],
  PasteNotes: [{ code: 'KeyV', ctrl: true }, { code: 'KeyV', meta: true }],
  CopyNotes: [{ code: 'KeyC', ctrl: true }, { code: 'KeyC', meta: true }],
  CutNotes: [{ code: 'KeyX', ctrl: true }, { code: 'KeyX', meta: true }],
  DeleteNotes: { code: 'Delete' },
  ToggleVelocityTool: { code: 'KeyV' },
  TransportPlay: { code: 'Space' },
  TransportStop: { code: 'Space', shift: true },
  SeekBackward: { code: 'KeyA', shift: true },
  SeekForward: { code: 'KeyD', shift: true },
  SeekMeasureBack: { code: 'KeyS', shift: true },
  SeekMeasureForward: { code: 'KeyW', shift: true },
  ApplyDuration1: { code: 'Digit1' },
  ApplyDuration2: { code: 'Digit2' },
  ApplyDuration3: { code: 'Digit3' },
  ApplyDuration4: { code: 'Digit4' },
  ApplyDuration5: { code: 'Digit5' },
  ApplyDuration6: { code: 'Digit6' },
  ApplySnap1: { code: 'Digit1', shift: true },
  ApplySnap2: { code: 'Digit2', shift: true },
  ApplySnap3: { code: 'Digit3', shift: true },
  ApplySnap4: { code: 'Digit4', shift: true },
  ApplySnap5: { code: 'Digit5', shift: true },
  ApplySnap6: { code: 'Digit6', shift: true },
  ToggleDottedNotes: { code: 'Period' },
  ToggleTripletNotes: { code: 'Slash' },
  AIStartAutocomplete: { code: 'KeyG' },
  ToggleAIMode: { code: 'KeyG', shift: true },
  ApproveAutocomplete: { code: 'Tab' },
  SwitchToNoteMode: { code: 'KeyQ' },
  SwitchToAIMode: { code: 'KeyW' },
};
