// src/components/userSettings/skins/skins/verdantAlloy.ts

import type { InterfaceSkin } from '../interfaces/Skin.js';

export const verdantAlloySkin: InterfaceSkin = {
    name: 'Verdant Alloy',
  
    appBackground: 'bg-gradient-to-b from-gray-900 to-green-950',
    menuBackground: 'bg-gradient-to-tr from-emerald-800 to-lime-700',
    surfaceBackground: 'bg-emerald-950/70',
  
    accentColor: 'bg-lime-400',
    textColor: 'text-lime-100',
    borderColor: 'border-lime-400',
  
    buttonPrimaryColor: 'bg-emerald-600',
    buttonPrimaryColorHover: 'hover:bg-emerald-500',
  
    buttonSecondaryColor: 'bg-lime-700',
    buttonSecondaryColorHover: 'hover:bg-lime-600',
  
    buttonTertiaryColor: 'bg-gray-700',
    buttonTertiaryColorHover: 'hover:bg-gray-600',
  
    toggleTrackBase: 'bg-emerald-700',
    toggleTrackChecked: 'peer-checked:bg-lime-400',
    toggleKnobBase: 'after:border-lime-300',
    toggleKnobChecked: 'peer-checked:after:border-white'
  };
  