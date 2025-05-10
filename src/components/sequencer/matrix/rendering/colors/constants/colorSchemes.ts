
// src/components/sequencer/matrix/rendering/colors/constants/colorSchemes.ts

import type { GridColorScheme } from '@/components/sequencer/matrix/rendering/colors/interfaces/GridColorScheme.js';

export const GRID_COLOR_SCHEMES: Record<string, GridColorScheme> = {
    Midnight: {
      whiteKey: '#1e1e1e',
      blackKey: '#2a103b',
      labelWhite: '#2c2c2c',
      labelBlack: '#3a1d4d',
      textWhite: '#cfcfcf',
      textBlack: '#e6d9ff',
      gridLine: '#333',
      beatLine: '#4e3d63',
      measureLine: '#8561c2',
    },
    Seashell: {
      whiteKey: '#fefefe',
      blackKey: '#f1e7dc',
      labelWhite: '#dddddd',
      labelBlack: '#d4cfc9',
      textWhite: '#444',
      textBlack: '#663300',
      gridLine: '#ccc',
      beatLine: '#bbb',
      measureLine: '#999',
    },
    Cyberpunk: {
      whiteKey: '#162447',
      blackKey: '#1b1b2f',
      labelWhite: '#1f4068',
      labelBlack: '#1f4068',
      textWhite: '#e43f5a',
      textBlack: '#e43f5a',
      gridLine: '#1f4068',
      beatLine: '#e43f5a',
      measureLine: '#ffcc00',
    },
    'Classic Blue': {
      whiteKey: '#f5faff',
      blackKey: '#dceeff',
      labelWhite: '#aaccee',
      labelBlack: '#88bbdd',
      textWhite: '#002244',
      textBlack: '#001122',
      gridLine: '#99bbdd',
      beatLine: '#88aacc',
      measureLine: '#336699',
    },
    Darkroom: {
      whiteKey: '#2c2c2c',
      blackKey: '#1e1e1e',
      labelWhite: '#2a2a2a',
      labelBlack: '#383838',
      textWhite: '#e0e0e0',
      textBlack: '#a0a0a0',
      gridLine: '#404040',
      beatLine: '#606060',
      measureLine: '#808080',
    }
  };
  