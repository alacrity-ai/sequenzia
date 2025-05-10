// src/components/userSettings/skins/skins/sunsetMirageSkin.ts

import type { InterfaceSkin } from '../interfaces/Skin.js';


export const sunsetSkin: InterfaceSkin = {
    name: 'Sunset',
  
    appBackground: 'bg-gradient-to-br from-orange-900 via-red-800 to-purple-900',
    menuBackground: 'bg-gradient-to-bl from-rose-800 to-orange-700',
    surfaceBackground: 'bg-orange-950/70',
  
    accentColor: 'bg-yellow-400',
    textColor: 'text-yellow-100',
    borderColor: 'border-yellow-400',
  
    buttonPrimaryColor: 'bg-amber-600',
    buttonPrimaryColorHover: 'hover:bg-amber-500',
  
    buttonSecondaryColor: 'bg-red-700',
    buttonSecondaryColorHover: 'hover:bg-red-600',
  
    buttonTertiaryColor: 'bg-purple-700',
    buttonTertiaryColorHover: 'hover:bg-purple-600',
  
    toggleTrackBase: 'bg-red-700',
    toggleTrackChecked: 'peer-checked:bg-yellow-400',
    toggleKnobBase: 'after:border-orange-300',
    toggleKnobChecked: 'peer-checked:after:border-white'
  };
  