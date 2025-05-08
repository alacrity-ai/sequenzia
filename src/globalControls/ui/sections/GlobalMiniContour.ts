// src/globalControls/ui/sections/GlobalMiniContour.ts

import { h } from '@/shared/ui/domUtils.js';
import { getAssetPath } from '@/global/assetHelpers.js';

export function createGlobalMiniContour(): HTMLElement {
    const canvasContainer = h('div', {
      class: 'absolute w-[1260px] left-0 bg-gray-800 rounded border border-purple-700',
    },
      h('canvas', {
        id: 'global-mini-contour',
        class: 'w-full h-full absolute top-0 left-0 z-0'
      }),
      h('canvas', {
        id: 'global-mini-playhead',
        class: 'w-full h-full absolute top-0 left-0 z-10'
      })
    );
  
    const contourWrapper = h('div', { class: 'flex-1' }, canvasContainer);
  
    const expandButton = h('button', {
      id: 'global-mini-expand-btn',
      class: 'side-button side-button-primary',
      title: 'Expand Global Overview'
    },
      h('img', {
        src: getAssetPath('static/svg/icon-caret-up.svg'),
        class: 'w-6 h-6',
        alt: 'Expand'
      })
    );
  
    const expandButtonContainer = h('div', {
      class: 'absolute left-[calc(100%+10px)] flex-col gap-2',
    }, expandButton);
  
    return h('div', {
      id: 'globalControls-miniContour-body',
      class: 'relative flex items-start gap-2 w-[1260px] mx-auto px-100'
    },
      contourWrapper,
      expandButtonContainer
    );
  }
