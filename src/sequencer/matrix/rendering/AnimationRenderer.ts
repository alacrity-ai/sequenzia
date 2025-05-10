// src/sequencer/matrix/renderers/AnimationRenderer.ts

import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { Note } from '../../../shared/interfaces/Note.js';
import { pitchToMidi } from '../../../shared/utils/musical/noteUtils.js';
import { getTempo } from '@/shared/playback/transportService.js';

interface ActiveNoteAnimation {
  note: Note;
  startTime: number;
  duration: number;
  hue: number;
}

export class AnimationRenderer {
  private animations: ActiveNoteAnimation[] = [];

  constructor(
    private scroll: GridScroll,
    private config: GridConfig
  ) {}

  public playNote(note: Note): void {
    const startTime = performance.now();
    const bpm = getTempo();
    let duration = (note.duration * 60000) / bpm;
    duration = Math.max(100, Math.min(duration, 1600));

    const midi = pitchToMidi(note.pitch) || 0;
    const hue = (midi * 5) % 360;

    this.animations.push({ note, startTime, duration, hue });
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const {
      layout: { baseCellWidth, verticalCellRatio, labelWidth, headerHeight, lowestMidi, highestMidi },
      behavior: { zoom }
    } = this.config;

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();

    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    const now = performance.now();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.animations = this.animations.filter(anim => {
      const t = (now - anim.startTime) / anim.duration;
      if (t > 1) return false;

      const { note, hue } = anim;
      const midi = pitchToMidi(note.pitch);
      if (midi == null || midi < lowestMidi || midi > highestMidi) return true;

      const row = highestMidi - midi;
      const x = note.start * cellWidth + labelWidth - scrollX;
      const y = row * cellHeight + headerHeight - scrollY;
      const w = note.duration * cellWidth;
      const h = cellHeight - 1;
      const cx = x + w / 2;
      const cy = y + h / 2;

      const pulseAlpha = Math.sin(t * Math.PI);
      const fillColor = `hsla(${hue}, 100%, 70%, ${0.4 * pulseAlpha})`;

      ctx.save();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 4);
      ctx.fill();

      const rippleCount = 2;
      const rippleDelay = 50;

      for (let i = 0; i < rippleCount; i++) {
        const rippleOffset = i * rippleDelay;
        const localT = Math.max(0, Math.min(1, (now - anim.startTime - rippleOffset) / (anim.duration - rippleOffset)));
        const pulse = Math.sin(localT * Math.PI);
        const scale = 1 + (0.1 + i * 0.1) * pulse;
        const alpha = (1 - localT) * 0.3;

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
        ctx.lineWidth = 1.5;

        const rippleW = w * scale;
        const rippleH = h * scale;
        ctx.beginPath();
        ctx.roundRect(cx - rippleW / 2, cy - rippleH / 2, rippleW, rippleH, 4);
        ctx.stroke();
      }

      ctx.restore();
      return true;
    });

    // Optional: if you want persistent animation draw loop instead of external triggers
    if (this.animations.length > 0) requestAnimationFrame(() => this.draw(ctx));
  }
}
