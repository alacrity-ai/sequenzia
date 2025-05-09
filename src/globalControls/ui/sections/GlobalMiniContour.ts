import { GLOBAL_TRANSPORT_CANVAS_WIDTH } from '../../constants.js';
import { h } from '@/shared/ui/domUtils.js';
import { getAssetPath } from '@/global/assetHelpers.js';

const caretIconUp = getAssetPath('static/svg/icon-caret-up.svg'); // Expand

export function createGlobalMiniContour(): HTMLElement {
  const WIDTH = `w-[${GLOBAL_TRANSPORT_CANVAS_WIDTH}px]`;
  const COLLAPSED_HEIGHT = 'h-[75px]';

  // Wrapper that centers the canvas and serves as relative anchor
  const canvasContainer = h('div', {
    class: 'relative flex justify-center w-full mt-4'
  });

  const canvasWrapper = h('div', {
    class: `relative ${WIDTH} ${COLLAPSED_HEIGHT} bg-gray-900/80 backdrop-blur-sm shadow-md rounded-xl`
  },
    h('canvas', {
      id: 'global-mini-contour',
      class: `absolute top-0 left-0 ${WIDTH} ${COLLAPSED_HEIGHT} z-0`
    }),
    h('canvas', {
      id: 'global-mini-playhead',
      class: `absolute top-0 left-0 ${WIDTH} ${COLLAPSED_HEIGHT} z-10`
    })
  );  

  const caretImg = h('img', {
    id: 'global-mini-collapse-icon',
    src: caretIconUp,
    class: 'w-4 h-4',
    style: 'cursor: pointer;',
    alt: 'Expand Mini Contour'
  });

  const collapseButton = h('button', {
    id: 'global-mini-collapse-btn',
    class: 'absolute right-[calc(50%-600px)] bottom-0 mb-2 p-2 bg-purple-700 text-white text-sm rounded hover:bg-purple-600 transition-colors',
    title: 'Expand Mini Contour'
  }, caretImg);  

  // Inject both canvas and absolutely-positioned button
  canvasContainer.appendChild(canvasWrapper);
  canvasContainer.appendChild(collapseButton);

  return h('div', {
    id: 'globalControls-miniContour-body',
    class: 'w-full max-w-[1260px] mx-auto'
  }, canvasContainer);
}
