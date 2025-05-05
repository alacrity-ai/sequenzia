// src/sequencer/grid/interaction/globalEditHotkeys.ts

import { performCopy, performCut, performPaste, performDelete } from './editActions.js';

export function setupGlobalEditHotkeys(): void {
  // document.addEventListener('keydown', (e: KeyboardEvent) => {
  //   const isMac = navigator.platform.toUpperCase().includes('MAC');
  //   const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
  //   const activeElement = document.activeElement;
  //   const tag = activeElement instanceof HTMLElement ? activeElement.tagName : null;

  //   if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  //   switch (true) {
  //     case ctrlKey && e.key === 'c':
  //       e.preventDefault();
  //       performCopy();
  //       break;
  //     case ctrlKey && e.key === 'x':
  //       e.preventDefault();
  //       performCut();
  //       break;
  //     case ctrlKey && e.key === 'v':
  //       e.preventDefault();
  //       performPaste();
  //       break;
  //     case e.key === 'Delete':
  //       e.preventDefault();
  //       performDelete();
  //       break;
  //   }
  // });
}
