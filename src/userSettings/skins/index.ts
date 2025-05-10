// src/userSettings/skins/interfaces/Skin.ts

// src/userSettings/skins/index.ts

import { defaultSkin } from './skins/defaultSkin.js';
import { blueDreamSkin } from './skins/blueDreamSkin.js';
import { modernLightSkin } from './skins/modernLightSkin.js';
import { synthwaveSkin } from './skins/synthwaveSkin.js';
import { verdantAlloySkin } from './skins/verdantAlloy.js';
import { sunsetSkin } from './skins/sunsetSkin.js';

import type { InterfaceSkin } from './interfaces/Skin.js';

export const SKIN_REGISTRY: Record<string, InterfaceSkin> = {
  'Default': defaultSkin,
  'Blue Dream': blueDreamSkin,
  'Modern Light': modernLightSkin,
  'Synthwave': synthwaveSkin,
  'Verdant Alloy': verdantAlloySkin,
  'Sunset': sunsetSkin
};

export function getSkinByName(name: string): InterfaceSkin {
    return SKIN_REGISTRY[name] || defaultSkin;
  }
  
