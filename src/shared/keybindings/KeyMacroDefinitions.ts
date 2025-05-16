// src/shared/keybindings/KeyMacroDefinitions.ts

export type KeyMacroName = keyof typeof KeyMacroNames;

export const KeyMacroNames = {
  Undo: 'Undo',
  Redo: 'Redo',
  PasteNotes: 'PasteNotes',
  CopyNotes: 'CopyNotes',
  CutNotes: 'CutNotes',
  DeleteNotes: 'DeleteNotes',
  ToggleVelocityTool: 'ToggleVelocityTool',
  TransportPlay: 'TransportPlay',
  TransportStop: 'TransportStop',
  SeekBackward: 'SeekBackward',
  SeekForward: 'SeekForward',
  SeekMeasureBack: 'SeekMeasureBack',
  SeekMeasureForward: 'SeekMeasureForward',
  ApplyDuration1: 'ApplyDuration1',
  ApplyDuration2: 'ApplyDuration2',
  ApplyDuration3: 'ApplyDuration3',
  ApplyDuration4: 'ApplyDuration4',
  ApplyDuration5: 'ApplyDuration5',
  ApplyDuration6: 'ApplyDuration6',
  ApplySnap1: 'ApplySnap1',
  ApplySnap2: 'ApplySnap2',
  ApplySnap3: 'ApplySnap3',
  ApplySnap4: 'ApplySnap4',
  ApplySnap5: 'ApplySnap5',
  ApplySnap6: 'ApplySnap6',
  ToggleDottedNotes: 'ToggleDottedNotes',
  ToggleTripletNotes: 'ToggleTripletNotes',
  AIStartAutocomplete: 'AIStartAutocomplete',
  ToggleAIMode: 'ToggleAIMode',
  ApproveAutocomplete: 'ApproveAutocomplete',
  SwitchToNoteMode: 'SwitchToNoteMode',
  SwitchToAIMode: 'SwitchToAIMode',
} as const;

