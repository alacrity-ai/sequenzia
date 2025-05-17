// src/shared/keybindings/KeyMacroSections.ts

import type { KeyMacroSectionDefinition } from './interfaces/KeyMacroSectionDefinition';

export const KeyMacroSections: KeyMacroSectionDefinition[] = [
  {
    name: 'Global',
    description: 'Common editing operations.',
    macros: [
      'ShowHotkeys', 'Undo', 'Redo', 'PasteNotes', 'CopyNotes', 'CutNotes', 'DeleteNotes'
    ]
  },
  {
    name: 'Note Editing',
    description: 'Tools and overrides for note manipulation.',
    macros: [
      'ToggleDottedNotes', 'ToggleTripletNotes',
      'ApplyDuration1', 'ApplyDuration2', 'ApplyDuration3', 'ApplyDuration4', 'ApplyDuration5', 'ApplyDuration6',
      'ApplySnap1', 'ApplySnap2', 'ApplySnap3', 'ApplySnap4', 'ApplySnap5', 'ApplySnap6'
    ]
  },
  {
    name: 'Tools',
    description: 'Additional editing tools and utilities.',
    macros: [
      'ToggleVelocityTool', 'ToggleQuantizeTool', 'ToggleTransposeTool', 'ToggleChordifyTool', 'ToggleHumanizeTool'
    ]
  },
  {
    name: 'Transport',
    description: 'Playback and navigation controls.',
    macros: [
      'TransportPlay', 'TransportStop',
      'SeekBackward', 'SeekForward', 'SeekMeasureBack', 'SeekMeasureForward'
    ]
  },
  {
    name: 'AI Mode',
    description: 'Autocomplete and AI-assisted operations.',
    macros: [
      'AIStartAutocomplete', 'ToggleAIMode', 'ApproveAutocomplete', 'RejectAutocomplete', 'SwitchToNoteMode', 'SwitchToAIMode'
    ]
  }
];
