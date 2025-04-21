import { drawGlobalMiniContour } from '../sequencer/mini-contour.js';
import { getSequencers, config } from '../setup/sequencers.js';
import { getTotalBeats } from '../helpers.js';
import { drawExtendPlayhead } from './drawing/ExtendMiniContour.js';

let controlsInitialized = false;

export function setupExtendModeControls() {
  if (!controlsInitialized) {
    controlsInitialized = true;

    // === One-time Bindings ===
    const checkbox = document.getElementById('extend-use-tags');
    const tagsInput = document.getElementById('extend-tags');

    if (checkbox && tagsInput) {
      function updateTagInputState() {
        const enabled = checkbox.checked;
        tagsInput.disabled = !enabled;
        tagsInput.classList.toggle('opacity-50', !enabled);
        tagsInput.classList.toggle('cursor-not-allowed', !enabled);
      }

      updateTagInputState();
      checkbox.addEventListener('change', updateTagInputState);
    }

    // === Help Popup Logic (bind once) ===
    const helpBtn = document.getElementById('extend-start-help-btn');
    const helpPopup = document.getElementById('extend-start-help-popup');
    const helpClose = document.getElementById('extend-start-help-close');

    if (helpBtn && helpPopup && helpClose) {
      helpBtn.addEventListener('click', () => helpPopup.classList.remove('hidden'));
      helpClose.addEventListener('click', () => helpPopup.classList.add('hidden'));
      document.addEventListener('click', e => {
        if (!helpPopup.contains(e.target) && e.target !== helpBtn) {
          helpPopup.classList.add('hidden');
        }
      });
    }

    // === Generate Button Logic (bind once) ===
    const generateBtn = document.querySelector('#ai-extend-modal .generate-btn');
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
      checkbox.dataset.index = index;
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
      checkboxContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
      redrawMiniContour();
    });

    deselectAllBtn.addEventListener('click', () => {
      checkboxContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      redrawMiniContour();
    });

    redrawMiniContour();
  }
}

let dragActive = false;
let startBeat = 0;

export function getStartBeat() {
    return startBeat;
  }

export function setupExtendModeUI() {
  const contourCanvas = document.getElementById('extend-mini-contour');
  const playheadCanvas = document.getElementById('extend-mini-playhead');

  if (!contourCanvas || !playheadCanvas) return;

  const ctx = playheadCanvas.getContext('2d');
  const width = contourCanvas.clientWidth;
  const height = contourCanvas.clientHeight;

  contourCanvas.width = width;
  contourCanvas.height = height;
  playheadCanvas.width = width;
  playheadCanvas.height = height;

  redrawMiniContour();
  drawExtendPlayhead(ctx, width, height, startBeat);

  playheadCanvas.addEventListener('mousedown', (e) => {
    dragActive = true;
    updatePlayhead(e.offsetX);
  });

  window.addEventListener('mouseup', () => {
    dragActive = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragActive) return;
    const rect = playheadCanvas.getBoundingClientRect();
    updatePlayhead(e.clientX - rect.left);
  });

  function updatePlayhead(x) {
    const totalBeats = getTotalBeats(config);
    const clampedX = Math.max(0, Math.min(x, width));
    startBeat = Math.round((clampedX / width) * totalBeats);
    drawExtendPlayhead(ctx, width, height, startBeat);
  }
}

function redrawMiniContour() {
    const contourCanvas = document.getElementById('extend-mini-contour');
    const playheadCanvas = document.getElementById('extend-mini-playhead');
    const ctx = playheadCanvas.getContext('2d');
    const width = playheadCanvas.width;
    const height = playheadCanvas.height;
  
    const checkboxes = document.querySelectorAll('#extend-track-checkboxes input[type="checkbox"]');
    const selectedIndices = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.dataset.index, 10));
  
    const selectedSequencers = getSequencers().filter((_, i) => selectedIndices.includes(i));
  
    drawGlobalMiniContour(contourCanvas, selectedSequencers);
    drawExtendPlayhead(ctx, width, height, startBeat);
}
  