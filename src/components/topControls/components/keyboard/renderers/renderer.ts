// src/keyboard/renderer.ts

import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';
import { KeyInfo } from '../helpers/keys.js';

interface DrawKeyOptions {
  x: number;
  width: number;
  height: number;
  fill: CanvasGradient;
  stroke: string;
  radius?: number;
}

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);

  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));

  return `rgb(${R},${G},${B})`;
}


/**
 * Draws the keyboard based on provided key map and highlighted notes.
 */
export function drawKeys(
  ctx: CanvasRenderingContext2D,
  keyMap: Record<string, KeyInfo>,
  highlightNotes: Set<string> = new Set(),
  keyToNoteMap: Record<string, string> | null = null,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const { whiteKeyColor, blackKeyColor } = getCurrentSkin();
  const noteToKey: Record<string, string> = {};

  if (keyToNoteMap) {
    for (const [keyChar, note] of Object.entries(keyToNoteMap)) {
      noteToKey[note] = keyChar;
    }
  }

  // === WHITE KEYS ===
  for (const key of Object.values(keyMap)) {
    if (!key.isBlack) {
      const grad = ctx.createLinearGradient(0, 0, 0, key.height);
      if (highlightNotes.has(key.note)) {
        grad.addColorStop(0, '#99cfff');
        grad.addColorStop(1, '#cce0ff');
      } else {
        grad.addColorStop(0, shadeColor(whiteKeyColor, -20));
        grad.addColorStop(1, whiteKeyColor);
      }

      drawRoundedKey(ctx, {
        ...key,
        fill: grad,
        stroke: '#333',
        radius: 6
      });

      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';

      if (noteToKey[key.note]) {
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(noteToKey[key.note], key.x + key.width / 2, key.height - 24);
        ctx.fillStyle = '#333';
      }

      ctx.fillText(key.note, key.x + key.width / 2, key.height - 8);
    }
  }

  // === BLACK KEYS ===
  for (const key of Object.values(keyMap)) {
    if (key.isBlack) {
      const grad = ctx.createLinearGradient(0, 0, 0, key.height);
      if (highlightNotes.has(key.note)) {
        grad.addColorStop(0, '#3040ff');
        grad.addColorStop(1, '#4a60ff');
      } else {
        grad.addColorStop(0, shadeColor(blackKeyColor, -20));
        grad.addColorStop(1, blackKeyColor);
      }

      drawRoundedKey(ctx, {
        ...key,
        fill: grad,
        stroke: '#000000',
        radius: 4
      });

      if (noteToKey[key.note]) {
        ctx.fillStyle = '#c084fc';
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
