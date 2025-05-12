// src/components/sequencerNew/ui/sequencerBody.ts

import { h } from '@/shared/ui/domUtils.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface SequencerBody {
  element: HTMLElement;
  topBarContainer: HTMLElement;
  miniContourCanvas: HTMLCanvasElement;
  matrixContainer: HTMLElement;
  gripHandleContainer: HTMLElement;
}

export function createSequencerBody(): SequencerBody {
  const skin = getCurrentSkin();

  // === Top bar container
  const topBarContainer = h('div', {
    class: `sequencer-header flex justify-between items-center ${skin.textColor}`
  });

  // === Mini contour canvas (initially hidden)
  const miniContourCanvas = h('canvas', {
    class: 'mini-contour w-full h-10 mb-2 bg-gray-800 rounded hidden'
  }) as HTMLCanvasElement;

  // === Grid canvas container
  const matrixContainer = h('div', {
    class: `sequencer-body flex pt-2 h-[720px] border-t ${skin.borderColor}`
  });

  // === Grip handle (track reorder handle)
  const gripHandleContainer = h('div', {
    class: 'grip-handle group flex justify-center items-center h-6 cursor-grab hover:bg-gray-800 rounded'
  }, icon('icon-grip', 'Drag Track'));

  // === Root sequencer wrapper
  const element = h('div', {
    class: `sequencer flex flex-col space-y-2 p-4 rounded ${skin.surfaceBackground}`
  },
    topBarContainer,
    miniContourCanvas,
    matrixContainer,
    gripHandleContainer
  );

  return {
    element,
    topBarContainer,
    miniContourCanvas,
    matrixContainer,
    gripHandleContainer
  };
}
