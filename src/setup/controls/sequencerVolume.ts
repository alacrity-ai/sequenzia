import Sequencer from '../../sequencer/sequencer.js';

export function setupVolumeBar(wrapper: HTMLElement, seq: Sequencer): void {
  const volumeBar = wrapper.querySelector('.volume-fill')?.parentElement as HTMLElement;
  const volumeFill = wrapper.querySelector('.volume-fill') as HTMLElement;
  const volumeThumb = wrapper.querySelector('.volume-thumb') as HTMLElement;
  

  if (!volumeBar || !volumeFill) {
    console.warn('[setupVolumeBar] Volume bar or fill element missing.');
    return;
  }

  function updateVisualBar(): void {
    const clamped = Math.max(0, Math.min(1, seq.volume));
    const percent = Math.round(clamped * 100);
    const barWidth = volumeBar.clientWidth;
    const thumbWidth = 14; // matches .volume-thumb width
    const minX = 0;
    const maxX = barWidth - thumbWidth;
  
    const posX = clamped * barWidth;
    const clampedLeft = Math.max(minX, Math.min(maxX, posX - thumbWidth / 2));
  
    volumeFill.style.width = `${percent}%`;
    volumeThumb.style.left = `${clampedLeft}px`;
    volumeBar.setAttribute('title', `Volume: ${percent}%`);
  }

  requestAnimationFrame(updateVisualBar);

  function handleVolumeInput(clientX: number): void {
    const rect = volumeBar.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
    seq.volume = ratio;
    updateVisualBar();
  }

  let isDragging = false;

  volumeBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleVolumeInput(e.clientX);
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    handleVolumeInput(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) isDragging = false;
  });
}
