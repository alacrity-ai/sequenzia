// src/components/userSettings/skins/skins/cyberpunkSkin.ts

import type { InterfaceSkin } from '../interfaces/Skin.js';

export const synthwaveSkin: InterfaceSkin = {
    name: 'Synthwave',
  
    appBackground: 'bg-gradient-to-br from-black via-gray-900 to-purple-950',
    menuBackground: 'bg-gradient-to-br from-purple-800 to-pink-900',
    surfaceBackground: 'bg-gray-900/80',
  
    accentColor: 'bg-fuchsia-500',
    textColor: 'text-neon-green',
    borderColor: 'border-fuchsia-500',
  
    buttonPrimaryColor: 'bg-pink-700',
    buttonPrimaryColorHover: 'hover:bg-pink-600',
    buttonSecondaryColor: 'bg-purple-800',
    buttonSecondaryColorHover: 'hover:bg-purple-700',
    buttonTertiaryColor: 'bg-gray-800',
    buttonTertiaryColorHover: 'hover:bg-gray-700',
  
    toggleTrackBase: 'bg-pink-800',
    toggleTrackChecked: 'peer-checked:bg-fuchsia-500',
    toggleKnobBase: 'after:border-pink-400',
    toggleKnobChecked: 'peer-checked:after:border-white',

    blackKeyColor: '#d946ef', // Tailwind fuchsia-500 — rich, vibrant, but not retina-searing
    whiteKeyColor: '#f5d0fe',  // Tailwind fuchsia-100 — warm pastel pink for balance
  
    volumeGradientFrom: 'from-fuchsia-500',
    volumeGradientTo: 'to-pink-400',
    volumeThumbColor: 'bg-fuchsia-400',

    panGradientFrom: 'from-purple-600',
    panGradientTo: 'to-purple-400',
    panThumbColor: 'bg-purple-500',

    snapMarkerColor: 'bg-fuchsia-300/50'
  };
  