// src/components/sequencer/ui/topBar.ts

import { h } from '@/shared/ui/domUtils.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

export interface TopBarSections {
  element: HTMLElement;
  leftGroup: HTMLElement;
  volumeWrapper: HTMLElement;
  panWrapper: HTMLElement;
  zoomWrapper: HTMLElement;
  rightControlsWrapper: HTMLElement;
}

export function createTopBar(): TopBarSections {
  const skin = getCurrentSkin();

  // === Left group: Instrument select + track name
  const leftGroup = h('div', {
    class: 'sequencer-left-group-wrapper flex items-center gap-2'
  });

  // === Volume wrapper
  const volumeWrapper = h('div', {
    class: 'sequencer-volume-wrapper'
  });

  // === Pan wrapper
  const panWrapper = h('div', {
    class: 'sequencer-pan-wrapper'
  });

  // === Zoom group wrapper
  const zoomWrapper = h('div', {
    class: 'sequencer-zoom-wrapper flex items-center gap-2'
  });

  // === Right controls (mute, solo, collapse, delete)
  const rightControlsWrapper = h('div', {
    class: 'sequencer-right-controls-wrapper flex items-center gap-2'
  });

  // === Aggregate right group
  const rightGroup = h('div', {
    class: 'sequencer-right-group-container flex items-center gap-3'
  },
    volumeWrapper,
    panWrapper,
    zoomWrapper,
    rightControlsWrapper
  );

  // === Top bar root
  const element = h('div', {
    class: `sequencer-header flex justify-between items-center w-full px-2 ${skin.textColor}`
  },
    leftGroup,
    rightGroup
  );

  return {
    element,
    leftGroup,
    volumeWrapper,
    panWrapper,
    zoomWrapper,
    rightControlsWrapper
  };
}
