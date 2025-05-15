import { pitchToMidi } from '@/sounds/audio/pitch-utils.js';
import { TRACK_COLORS } from '@/components/sequencer/matrix/rendering/colors/constants/trackColors.js';
import { getTotalBeats } from '@/shared/playback/transportService.js';

import { getAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { getAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { getAIIndicatorEnabled } from '@/components/userSettings/store/userConfigStore.js';
import { drawAIIndicatorChevron } from '@/shared/ui/canvas/drawAIIndicatorChevron.js';

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

  // === Draw AI Preview Notes ===
  const aiPreviewNotes = getAIPreviewNotes();
  if (aiPreviewNotes.length > 0 && sequencers.length > 0) {
    // Use noteRange from first sequencer for global pitch mapping
    const { config } = sequencers[0];
    const minMidi = pitchToMidi(config.noteRange[0]);
    const maxMidi = pitchToMidi(config.noteRange[1]);

    if (minMidi != null && maxMidi != null) {
      const pitchRange = maxMidi - minMidi || 1;
      const blockH = Math.max(2, H / pitchRange);

      ctx.fillStyle = 'rgba(252, 159, 207, 0.41)'; // AI preview pink

      for (const note of aiPreviewNotes) {
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

  // === Draw AI Indicator Chevron ===
  if (getAIIndicatorEnabled()) {
    const targetBeat = getAutoCompleteTargetBeat();
    if (targetBeat !== null) {
      const chevronX = (targetBeat / totalBeats) * W;
      const chevronWidth = W * 0.01;
      const chevronHeight = 6;

      drawAIIndicatorChevron(ctx, chevronX, chevronHeight, chevronWidth, chevronHeight, 'up');
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
