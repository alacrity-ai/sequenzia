// src/shared/keybindings/interfaces/KeyMacroBinding.ts

export interface KeyMacroBinding {
  code: string;  // e.g., 'KeyZ', 'BracketRight', 'Digit1'
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}