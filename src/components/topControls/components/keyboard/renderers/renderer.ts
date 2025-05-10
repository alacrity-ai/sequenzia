// src/keyboard/renderer.ts

import { KeyInfo } from '../helpers/keys.js';

interface DrawKeyOptions {
  x: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  radius?: number;
}

/**
 * Draws the keyboard based on provided key map and highlighted notes.
 */
export function drawKeys(
  ctx: CanvasRenderingContext2D,
  keyMap: Record<string, KeyInfo>,
  highlightNotes: Set<string> = new Set(),
  keyToNoteMap: Record<string, string> | null = null
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Invert keyToNoteMap to build note → keyChar lookup
  const noteToKey: Record<string, string> = {};
  if (keyToNoteMap) {
    for (const [keyChar, note] of Object.entries(keyToNoteMap)) {
      noteToKey[note] = keyChar;
    }
  }

  // Draw white keys
  for (const key of Object.values(keyMap)) {
    if (!key.isBlack) {
      drawRoundedKey(ctx, {
        ...key,
        fill: highlightNotes.has(key.note) ? '#cce0ff' : '#ffffff',
        stroke: '#333',
        radius: 6
      });

      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';

      if (noteToKey[key.note]) {
        ctx.fillStyle = '#7c3aed'; // dark purple
        ctx.fillText(noteToKey[key.note], key.x + key.width / 2, key.height - 24);
        ctx.fillStyle = '#333';
      }

      ctx.fillText(key.note, key.x + key.width / 2, key.height - 8);
    }
  }

  // Draw black keys
  for (const key of Object.values(keyMap)) {
    if (key.isBlack) {
      drawRoundedKey(ctx, {
        ...key,
        fill: highlightNotes.has(key.note) ? '#4a60ff' : '#111111',
        stroke: '#000000',
        radius: 4
      });

      drawGloss(ctx, key);

      if (noteToKey[key.note]) {
        ctx.fillStyle = '#c084fc'; // light purple
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(noteToKey[key.note], key.x + key.width / 2, key.height - 28);
      }
    }
  }
}

function drawRoundedKey(ctx: CanvasRenderingContext2D, options: DrawKeyOptions): void {
  const { x, width, height, fill, stroke, radius = 8 } = options;

  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height - radius);
  ctx.quadraticCurveTo(x, height, x + radius, height);
  ctx.lineTo(x + width - radius, height);
  ctx.quadraticCurveTo(x + width, height, x + width, height - radius);
  ctx.lineTo(x + width, 0);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawGloss(ctx: CanvasRenderingContext2D, key: KeyInfo): void {
  const grad = ctx.createLinearGradient(key.x, 0, key.x, key.height);
  grad.addColorStop(0, 'rgba(255,255,255,0.2)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(key.x, 0);
  ctx.lineTo(key.x + key.width, 0);
  ctx.lineTo(key.x + key.width, key.height * 0.4);
  ctx.lineTo(key.x, key.height * 0.4);
  ctx.closePath();
  ctx.fill();
}
