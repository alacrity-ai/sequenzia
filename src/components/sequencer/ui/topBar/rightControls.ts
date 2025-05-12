import { h } from '@/shared/ui/domUtils.js';
import { icon } from '@/shared/ui/primitives/createIconImg.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface RightControlsUI {
  element: HTMLElement;
  muteBtn: HTMLButtonElement;
  soloBtn: HTMLButtonElement;
  collapseBtn: HTMLButtonElement;
  deleteBtn: HTMLButtonElement;
}

/**
 * Creates the mute, solo, collapse, and delete buttons.
 */
export function createRightControls(): RightControlsUI {
  const skin = getCurrentSkin();

  const baseBtnClasses = [
    'side-button-secondary cursor-pointer px-2 py-1 rounded w-8',
    'flex items-center justify-center',
    skin.buttonSecondaryColor,
    skin.buttonSecondaryColorHover,
    skin.textColor
  ];

  const muteBtn = h('button', {
    class: [...baseBtnClasses, 'mute-btn'].join(' '),
    title: 'Mute Track'
  }, icon('icon-volume-mute', 'Mute Track')) as HTMLButtonElement;

  const soloBtn = h('button', {
    class: [...baseBtnClasses, 'solo-btn'].join(' '),
    title: 'Solo Track'
  }, icon('icon-headphones', 'Solo Track')) as HTMLButtonElement;

  const collapseBtn = h('button', {
    class: [...baseBtnClasses, 'collapse-btn'].join(' '),
    title: 'Expand/Collapse Track'
  }, icon('icon-caret-down', 'Expand/Collapse')) as HTMLButtonElement;

  const deleteBtn = h('button', {
    class: [
      ...baseBtnClasses,
      'delete-btn hover:bg-red-600'
    ].join(' '),
    title: 'Delete Track'
  }, icon('icon-close-circle', 'Delete Track')) as HTMLButtonElement;

  const element = h('div', {
    class: 'flex items-center gap-2'
  }, muteBtn, soloBtn, collapseBtn, deleteBtn);

  return {
    element,
    muteBtn,
    soloBtn,
    collapseBtn,
    deleteBtn
  };
}
