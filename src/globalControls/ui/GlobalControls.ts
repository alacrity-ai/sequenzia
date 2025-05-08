// src/globalControls/ui/GlobalControls.ts

import { h } from '@/shared/ui/domUtils';

export class GlobalControls {
  private mainWrapper: HTMLElement;
  private miniContourWrapper: HTMLElement;
  private innerWrapper: HTMLElement;
  private leftSideButtonsWrapper: HTMLElement;
  private toolbarWrapper: HTMLElement;
  private transportWrapper: HTMLElement;

  constructor() {
    // Individual sections
    this.miniContourWrapper = h('div', {
      id: 'globalControls-miniContour-wrapper',
      class: 'fixed bottom-[170px] left-0 right-0 z-30 bg-black',
    });

    this.leftSideButtonsWrapper = h('div', {
      id: 'globalControls-leftSideButtons-wrapper',
      class: 'absolute left-0 top-[60px] z-40 -translate-x-[46px] flex flex-col gap-2',
    });

    this.toolbarWrapper = h('div', {
      id: 'globalControls-toolbar-wrapper',
      class: 'flex justify-left gap-3 p-2 pl-32 border-b border-purple-800',
    });

    this.transportWrapper = h('div', {
      id: 'globalControls-transport-wrapper',
      class: 'flex justify-center gap-6 px-4 py-8 text-sm',
    });

    this.innerWrapper = h('div', {
      id: 'globalControls-inner-wrapper',
      class: 'relative w-[1260px] mx-auto bg-gray-900 border-t border-purple-800',
    },
      this.leftSideButtonsWrapper,
      this.toolbarWrapper,
      this.transportWrapper
    );

    this.mainWrapper = h('div', {
      id: 'globalControls-main-wrapper',
      class: 'fixed bottom-0 left-0 right-0 z-40 content-hidden',
    },
      this.miniContourWrapper,
      this.innerWrapper
    );

    // Inject into footer
    const footer = document.getElementById('footer-main');
    if (footer) {
      footer.appendChild(this.mainWrapper);
    } else {
      console.warn('footer-main container not found. GlobalControls not injected.');
    }
  }

  public render(): HTMLElement {
    return this.mainWrapper;
  }

  public destroy(): void {
    this.mainWrapper.remove();
  }

  // Accessors for injecting child components
  public getMiniContourWrapper(): HTMLElement {
    return this.miniContourWrapper;
  }

  public getToolbarWrapper(): HTMLElement {
    return this.toolbarWrapper;
  }

  public getTransportWrapper(): HTMLElement {
    return this.transportWrapper;
  }

  public getLeftSideButtonsWrapper(): HTMLElement {
    return this.leftSideButtonsWrapper;
  }
}
