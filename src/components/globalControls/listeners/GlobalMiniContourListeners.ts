import type { ListenerAttachment } from '@/components/userSettings/interfaces/ListenerAttachment.js';
import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';

const caretIconUp = getAssetPath('static/svg/icon-caret-up.svg');
const caretIconDown = getAssetPath('static/svg/icon-caret-down.svg');

export function attachContourListeners(container: HTMLElement): ListenerAttachment {
  const refreshUI = () => { };

  const contourContainer = container.querySelector('#global-mini-contour')?.parentElement;
  const button = container.querySelector<HTMLButtonElement>('#global-mini-collapse-btn');
  const icon = container.querySelector<HTMLImageElement>('#global-mini-collapse-icon');

  const expandedHeight = 300;
  const collapsedHeight = 75;

  let isCollapsed = true; // start collapsed

  const handleExpandClick = () => {
    if (!contourContainer || !button || !icon) return;

    isCollapsed = !isCollapsed;

    contourContainer.style.height = isCollapsed ? `${collapsedHeight}px` : `${expandedHeight}px`;

    const canvases = contourContainer.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      (canvas as HTMLCanvasElement).style.height = isCollapsed ? `${collapsedHeight}px` : `${expandedHeight}px`;
    });

    icon.src = isCollapsed ? caretIconUp : caretIconDown;
    button.title = isCollapsed ? 'Expand Mini Contour' : 'Collapse Mini Contour';
  };

  button?.addEventListener('click', handleExpandClick);

  return {
    detach: () => {
      button?.removeEventListener('click', handleExpandClick);
    },
    refreshUI
  };
}
