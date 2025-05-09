// src/aimode/drawing/ExtendMiniContour.ts

import { getTotalBeats } from '../../sequencer/transport.js';
import { aiContext } from '../aiConfig.js';

/**
 * Draws a vertical playhead and a translucent context region to the left.
 * 
 * @param ctx - Canvas rendering context
 * @param canvasWidth - Width of the canvas
 * @param canvasHeight - Height of the canvas
 * @param startBeat - Beat where playhead starts
 */
export function drawExtendPlayhead(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  startBeat: number
): void {
  const totalBeats = getTotalBeats();
  const playheadX = (startBeat / totalBeats) * canvasWidth;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw context window box (backwards from playhead)
  const beatsBack = aiContext.maxBeatsContext;
  const leftBeat = Math.max(0, startBeat - beatsBack);
  const leftX = (leftBeat / totalBeats) * canvasWidth;
  const boxWidth = playheadX - leftX;

  ctx.fillStyle = 'rgba(85, 187, 255, 0.55)'; // light blue transparent
  ctx.fillRect(leftX, 0, boxWidth, canvasHeight);

  // Draw playhead line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX, canvasHeight);
  ctx.stroke();
}
