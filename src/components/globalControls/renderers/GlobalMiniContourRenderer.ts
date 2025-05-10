import { pitchToMidi } from '@/sounds/audio/pitch-utils.js';
import { TRACK_COLORS } from '@/components/sequencer/matrix/rendering/colors/constants/trackColors.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';

import type Sequencer from '@/components/sequencer/sequencer.js';

/**
 * Draws the global mini contour canvas.
 * Renders a compressed overview of all track notes by pitch and time.
 */
export function drawGlobalMiniContour(
  canvas: HTMLCanvasElement,
  sequencers: Sequencer[]
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const DPR = window.devicePixelRatio || 1;
  const W = canvas.width / DPR;
  const H = canvas.height / DPR;
  ctx.clearRect(0, 0, W, H);

  const totalBeats = getTotalBeats();

  for (const seq of sequencers) {
    const { notes, config } = seq;
    if (!notes?.length) continue;

    const color = TRACK_COLORS[sequencers.indexOf(seq) % TRACK_COLORS.length];
    ctx.fillStyle = color;

    const minMidi = pitchToMidi(config.noteRange[0]);
    const maxMidi = pitchToMidi(config.noteRange[1]);
    if (minMidi == null || maxMidi == null) continue;

    const pitchRange = maxMidi - minMidi || 1;
    const blockH = Math.max(2, H / pitchRange);

    for (const note of notes) {
      const midi = pitchToMidi(note.pitch);
      if (midi == null) continue;

      const x = (note.start / totalBeats) * W;
      const w = Math.max(1, (note.duration / totalBeats) * W);
      const norm = (midi - minMidi) / pitchRange;
      const y = H - norm * H - blockH / 2;

      ctx.fillRect(x, y, w, blockH);
    }
  }
}

/**
 * Lightweight alias for a full redraw of the mini contour canvas.
 */
export function refreshGlobalMiniContour(
  canvas: HTMLCanvasElement,
  sequencers: Sequencer[]
): void {
  drawGlobalMiniContour(canvas, sequencers);
}
