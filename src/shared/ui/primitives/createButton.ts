// src/shared/ui/primitives/createButton.ts
import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';

export interface ButtonOptions {
  id?: string;
  text: string;
  kind?: 'primary' | 'secondary' | 'tertiary';
  onClick?: (e: MouseEvent) => void;
  additionalClasses?: string;
}

/**
 * Creates a skinned button element using current UI theme.
 * Supports primary/secondary/tertiary button styles and hover feedback.
 */
export function createButton({
  id,
  text,
  kind = 'primary',
  onClick,
  additionalClasses = ''
}: ButtonOptions): HTMLButtonElement {
  const skin = getCurrentSkin();

  const baseColor = {
    primary: skin.buttonPrimaryColor,
    secondary: skin.buttonSecondaryColor,
    tertiary: skin.buttonTertiaryColor
  }[kind];

  const hoverColor = {
    primary: skin.buttonPrimaryColorHover,
    secondary: skin.buttonSecondaryColorHover,
    tertiary: skin.buttonTertiaryColorHover
  }[kind];

  return h('button', {
    id,
    class: [
      'cursor-pointer flex-1 py-2 rounded-lg transition-all text-sm',
      baseColor,
      hoverColor,
      skin.textColor,
      additionalClasses
    ].join(' '),
    textContent: text,
    onclick: onClick
  });
}
