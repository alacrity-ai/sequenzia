import { drawGlobalMiniContour } from '../sequencer/grid/drawing/mini-contour.js';
import { getSequencers } from '../setup/sequencers.js';
import { getTotalBeats } from '../sequencer/transport.js';
import { drawExtendPlayhead } from './drawing/ExtendMiniContour.js';

let controlsInitialized = false;
let dragActive = false;
let startBeat = 0;

export function getStartBeat(): number {
  return startBeat;
}

export function setupExtendModeControls(): void {
  if (!controlsInitialized) {
    controlsInitialized = true;

    // === One-time Bindings ===
    const checkbox = document.getElementById('extend-use-tags') as HTMLInputElement | null;
    const tagsInput = document.getElementById('extend-tags') as HTMLInputElement | null;

    if (checkbox && tagsInput) {
      const checkboxEl = checkbox;
      const tagsInputEl = tagsInput;
    
      function updateTagInputState(): void {
        const enabled = checkboxEl.checked;
        tagsInputEl.disabled = !enabled;
        tagsInputEl.classList.toggle('opacity-50', !enabled);
        tagsInputEl.classList.toggle('cursor-not-allowed', !enabled);
      }
    
      updateTagInputState();
      checkboxEl.addEventListener('change', updateTagInputState);
    }    

    // === Help Popup Logic (bind once) ===
    const helpBtn = document.getElementById('extend-start-help-btn');
    const helpPopup = document.getElementById('extend-start-help-popup');
    const helpClose = document.getElementById('extend-start-help-close');

    if (helpBtn && helpPopup && helpClose) {
      helpBtn.addEventListener('click', () => helpPopup.classList.remove('hidden'));
      helpClose.addEventListener('click', () => helpPopup.classList.add('hidden'));
      document.addEventListener('click', (e: MouseEvent) => {
        if (!(e.target instanceof Node)) return;
        if (!helpPopup.contains(e.target) && e.target !== helpBtn) {
          helpPopup.classList.add('hidden');
        }
      });
    }

    // === Generate Button Logic (bind once) ===
    const generateBtn = document.querySelector<HTMLButtonElement>('#ai-extend-modal .generate-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        const { extendTracksWithAI } = await import('./generation/extendTracks.js');
        await extendTracksWithAI();
      });
    }
  }

  // === Per-Open Logic: Track Checkboxes & Contour Refresh ===
  const checkboxContainer = document.getElementById('extend-track-checkboxes');
  const selectAllBtn = document.getElementById('extend-select-all');
  const deselectAllBtn = document.getElementById('extend-deselect-all');

  if (checkboxContainer && selectAllBtn && deselectAllBtn) {
    checkboxContainer.innerHTML = '';

    const sequencers = getSequencers();

    sequencers.forEach((seq, index) => {
      const id = `extend-track-${index}`;
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center gap-2';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = id;
      checkbox.dataset.index = index.toString();
      checkbox.checked = true;
      checkbox.className = 'w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500';

      const label = document.createElement('label');
      label.htmlFor = id;
      label.className = 'text-sm text-gray-200';
      label.textContent = seq.config.name || `Track ${index + 1}`;

      checkbox.addEventListener('change', () => {
        redrawMiniContour();
      });

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      checkboxContainer.appendChild(wrapper);
    });

    selectAllBtn.addEventListener('click', () => {
      checkboxContainer.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(cb => cb.checked = true);
      redrawMiniContour();
    });

    deselectAllBtn.addEventListener('click', () => {
      checkboxContainer.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(cb => cb.checked = false);
      redrawMiniContour();
    });

    redrawMiniContour();
  }
}

export function setupExtendModeUI(): void {
  const contourCanvas = document.getElementById('extend-mini-contour') as HTMLCanvasElement | null;
  const playheadCanvas = document.getElementById('extend-mini-playhead') as HTMLCanvasElement | null;

  if (!contourCanvas || !playheadCanvas) return;

  const ctx = playheadCanvas.getContext('2d');
  if (!ctx) return;

  const width = contourCanvas.clientWidth;
  const height = contourCanvas.clientHeight;

  contourCanvas.width = width;
  contourCanvas.height = height;
  playheadCanvas.width = width;
  playheadCanvas.height = height;

  redrawMiniContour();
  drawExtendPlayhead(ctx, width, height, startBeat);

  playheadCanvas.addEventListener('mousedown', (e: MouseEvent) => {
    dragActive = true;
    updatePlayhead(e.offsetX);
  });

  window.addEventListener('mouseup', () => {
    dragActive = false;
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (!dragActive) return;
    const rect = playheadCanvas.getBoundingClientRect();
    updatePlayhead(e.clientX - rect.left);
  });

  function updatePlayhead(x: number): void {
    if (!ctx) return; // Bail out if ctx somehow missing
  
    const totalBeats = getTotalBeats();
    const clampedX = Math.max(0, Math.min(x, width));
    startBeat = Math.round((clampedX / width) * totalBeats);
    drawExtendPlayhead(ctx, width, height, startBeat);
  }  
}

function redrawMiniContour(): void {
  const contourCanvas = document.getElementById('extend-mini-contour') as HTMLCanvasElement | null;
  const playheadCanvas = document.getElementById('extend-mini-playhead') as HTMLCanvasElement | null;
  if (!contourCanvas || !playheadCanvas) return;

  const ctx = playheadCanvas.getContext('2d');
  if (!ctx) return;

  const width = playheadCanvas.width;
  const height = playheadCanvas.height;

  const checkboxes = document.querySelectorAll<HTMLInputElement>('#extend-track-checkboxes input[type="checkbox"]');
  const selectedIndices = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => parseInt(cb.dataset.index || '0', 10));

  const selectedSequencers = getSequencers().filter((_, i) => selectedIndices.includes(i));

  drawGlobalMiniContour(contourCanvas, selectedSequencers);
  drawExtendPlayhead(ctx, width, height, startBeat);
}
