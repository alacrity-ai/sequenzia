import type Sequencer from '../../sequencer.js';
  
// Fades the opacity of the track if muted
export function updateTrackStyle(
    seq: Sequencer
): void {
    if (!seq.container) return;

    const muteBtn = seq.container.querySelector('.mute-btn');
    const soloBtn = seq.container.querySelector('.solo-btn');
    const body = seq.container.querySelector('.sequencer-body');
    const contour = seq.container.querySelector('.mini-contour');

    // Button styles
    muteBtn?.classList.toggle('bg-red-600', seq.mute);
    muteBtn?.classList.toggle('bg-gray-700', !seq.mute);

    soloBtn?.classList.toggle('bg-yellow-200', seq.solo);
    soloBtn?.classList.toggle('bg-gray-700', !seq.solo);

    const shouldFade = seq.mute && !seq.solo;

    // Fade scrollable grid area
    body?.classList.toggle('opacity-40', shouldFade);
    body?.classList.toggle('opacity-100', !shouldFade);

    // Fade mini contour
    contour?.classList.toggle('opacity-40', shouldFade);
    contour?.classList.toggle('opacity-100', !shouldFade);
}