// src/components/userSettings/skins/skins/defaultSkin.ts

import type { InterfaceSkin } from '../interfaces/Skin.js';

export const defaultSkin: InterfaceSkin = {
    name: 'Default',
  
    appBackground: 'bg-black',
    menuBackground: 'bg-gradient-to-br from-gray-800 to-gray-900',
    surfaceBackground: 'bg-gray-900',
  
    accentColor: 'bg-purple-700',
    textColor: 'text-white',
    borderColor: 'border-purple-950',

    buttonPrimaryColor: 'bg-purple-700',
    buttonPrimaryColorHover: 'hover:bg-purple-600',
    
    buttonSecondaryColor: 'bg-gray-800',
    buttonSecondaryColorHover: 'hover:bg-gray-700',
    
    buttonTertiaryColor: 'bg-blue-700',
    buttonTertiaryColorHover: 'hover:bg-blue-600',
    
  
    toggleTrackBase: 'bg-gray-700',
    toggleTrackChecked: 'peer-checked:bg-purple-600',
    toggleKnobBase: 'after:border-gray-300',
    toggleKnobChecked: 'peer-checked:after:border-white'
  };
  