// src/shared/keybindings/interfaces/KeyMacroSectionDefinition.ts

import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';

export interface KeyMacroSectionDefinition {
  name: string;
  description?: string;
  macros: KeyMacroName[];
}