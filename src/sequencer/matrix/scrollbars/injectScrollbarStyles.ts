// src/sequencer/matrix/scrollbars/injectScrollbarStyles.ts

let stylesInjected = false;

/**
 * Injects default scrollbar CSS styles into the document head.
 * Only runs once per session.
 */
export function injectScrollbarStyles(): void {
  if (stylesInjected) return;

  const style = document.createElement('style');
  style.textContent = `
    .grid-scrollbars {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .grid-scrollbar {
      position: absolute;
      background: #1f1f1f;
      pointer-events: all;
    }

    .grid-scrollbar-thumb {
      position: absolute;
      background: #888;
      border-radius: 6px;
      cursor: pointer;
    }

    .grid-scrollbar-corner {
      position: absolute;
      width: 12px;
      height: 12px;
      bottom: 0;
      right: 0;
      background: #1f1f1f;
      z-index: 2;
      pointer-events: none;
    }
  `;

  document.head.appendChild(style);
  stylesInjected = true;
}
