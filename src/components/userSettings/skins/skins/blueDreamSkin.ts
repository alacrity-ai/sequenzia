// src/components/userSettings/skins/skins/blueDreamSkin.ts

import type { InterfaceSkin } from '../interfaces/Skin.js';

export const blueDreamSkin: InterfaceSkin = {
    name: 'Blue Dream',
  
    appBackground: 'bg-gradient-to-b from-blue-900 to-gray-900',
    menuBackground: 'bg-gradient-to-br from-blue-800 to-blue-900',
    surfaceBackground: 'bg-blue-950/80',
  
    accentColor: 'bg-cyan-400',
    textColor: 'text-white',
    borderColor: 'border-cyan-400',
  
    buttonPrimaryColor: 'bg-cyan-600',
    buttonPrimaryColorHover: 'hover:bg-cyan-500',
    
    buttonSecondaryColor: 'bg-blue-800',
    buttonSecondaryColorHover: 'hover:bg-blue-700',
    
    buttonTertiaryColor: 'bg-indigo-600',
    buttonTertiaryColorHover: 'hover:bg-indigo-500',    
  
    toggleTrackBase: 'bg-blue-700',
    toggleTrackChecked: 'peer-checked:bg-cyan-400',
    toggleKnobBase: 'after:border-blue-300',
    toggleKnobChecked: 'peer-checked:after:border-white',

    blackKeyColor: '#1b1f5f',    // rich indigo-blue
    whiteKeyColor: '#c0e7ff'     // cool icy blue
  };
  