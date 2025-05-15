// src/components/sequencer/matrix/rendering/AIAnimationRenderer.ts

import type { GridScroll } from '../scrollbars/GridScroll.js';
import type { GridConfig } from '../interfaces/GridConfigTypes.js';
import type { Note } from '@/shared/interfaces/Note.js';

import { getTimeSignature } from '@/shared/playback/transportService.js';
import { getAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore.js';
import { noteToMidi, pitchToMidi } from '@/shared/utils/musical/noteUtils.js';

interface AcceptanceAnimation {
  note: Note;
  startTime: number;
  duration: number;
  hue: number;
}

export class AIAnimationRenderer {
  private isAnimating = false;
  private acceptanceAnimations: AcceptanceAnimation[] = [];
  private activeBarIndex: number | null = null;

  constructor(
    private scroll: GridScroll,
    private config: GridConfig,
    private ctx: CanvasRenderingContext2D
  ) {}

  public start(): void {
    if (!this.isAnimating) {
      this.isAnimating = true;
      requestAnimationFrame(this.renderFrame);
    }
  }

  public stop(): void {
    this.isAnimating = false;
  }

  public setActiveAutocompleteBar(barIndex: number | null): void {
    this.activeBarIndex = barIndex;
  }

  public invalidate(): void {
    if (!this.isAnimating) {
      this.isAnimating = true;
      requestAnimationFrame(this.renderFrame);
    }
  }

  public playNoteAcceptance(notes: Note[]): void {
    const startTime = performance.now();

    for (const note of notes) {
      const midi = pitchToMidi(note.pitch) || 0;
      const hue = (midi * 5) % 360;

      this.acceptanceAnimations.push({
        note,
        startTime,
        duration: 800, // shorter blast effect
        hue,
      });
    }

    // Kick off animation loop for acceptances
    if (!this.isAnimating) {
      this.isAnimating = true;
      requestAnimationFrame(this.renderFrame);
    }
  }

  public renderFrame = (timestamp: number): void => {
    if (!this.isAnimating) return;

    this.draw(timestamp);

    const hasOngoingAcceptance = this.acceptanceAnimations.length > 0;
    const hasOngoingPreview = getAIPreviewNotes().length > 0;
    const hasActiveBarHighlight = this.activeBarIndex !== null;

    if (hasOngoingAcceptance || hasOngoingPreview || hasActiveBarHighlight) {
      requestAnimationFrame(this.renderFrame);
    } else {
      // Stop if nothing left to animate
      this.isAnimating = false;
    }
  };

  private draw(timestamp: number): void {
    const {
      layout: { baseCellWidth, verticalCellRatio, labelWidth, headerHeight, lowestMidi, highestMidi },
      behavior: { zoom },
    } = this.config;

    const scrollX = this.scroll.getX();
    const scrollY = this.scroll.getY();

    const cellWidth = baseCellWidth * zoom;
    const cellHeight = cellWidth / verticalCellRatio;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const totalRows = highestMidi - lowestMidi + 1;

    // === Bar Highlight for Active Autocomplete Bar ===
    if (this.activeBarIndex !== null) {
      const pulse = 0.5 + 0.5 * Math.sin(timestamp * 0.005);

      const {
        layout: { baseCellWidth, verticalCellRatio, labelWidth, headerHeight, lowestMidi, highestMidi },
        behavior: { zoom },
      } = this.config;

      const scrollX = this.scroll.getX();
      const scrollY = this.scroll.getY();

      const cellWidth = baseCellWidth * zoom;
      const cellHeight = cellWidth / verticalCellRatio;

      const barStartX = this.activeBarIndex * cellWidth * (getTimeSignature() ?? 4) + labelWidth - scrollX;
      const barEndX = barStartX + (getTimeSignature() ?? 4) * cellWidth;

      const gridTop = headerHeight - scrollY;
      const gridHeight = (highestMidi - lowestMidi + 1) * cellHeight;

      // Draw highlight rect with pulsing opacity
      this.ctx.save();
      this.ctx.globalAlpha = 0.2 * pulse;
      this.ctx.fillStyle = 'rgba(244, 114, 181, 0.36)';
      this.ctx.fillRect(barStartX, gridTop, barEndX - barStartX, gridHeight);
      this.ctx.restore();
    }
    
    // === Persistent Pulse for AI Preview Notes ===
    const previewNotes = getAIPreviewNotes();
    if (previewNotes.length > 0) {
      const pulse = 0.5 + 0.5 * Math.sin(timestamp * 0.005);

      ctx.save();
      ctx.translate(labelWidth - scrollX, headerHeight - scrollY);

      for (const note of previewNotes) {
        const midi = noteToMidi(note.pitch);
        if (midi === null) continue;

        const row = totalRows - 1 - (midi - lowestMidi);
        const px = note.start * cellWidth;
        const py = row * cellHeight;
        const width = note.duration * cellWidth;

        ctx.fillStyle = `rgba(255, 100, 180, ${0.2 * pulse})`;
        ctx.beginPath();
        ctx.roundRect(px, py, width, cellHeight, 3);
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(255, 100, 180, ${0.3 * pulse})`;
        ctx.beginPath();
        ctx.roundRect(px, py, width, cellHeight, 3);
        ctx.stroke();
      }

      ctx.restore();
    }

    // === One-Shot WOW Acceptance Animation ===
    const now = performance.now();
    this.acceptanceAnimations = this.acceptanceAnimations.filter(anim => {
      const t = (now - anim.startTime) / anim.duration;
      if (t > 1) return false;

      const { note, hue } = anim;
      const midi = noteToMidi(note.pitch);
      if (midi === null || midi < lowestMidi || midi > highestMidi) return true;

      const row = totalRows - 1 - (midi - lowestMidi);
      const x = note.start * cellWidth + labelWidth - scrollX;
      const y = row * cellHeight + headerHeight - scrollY;
      const w = note.duration * cellWidth;
      const h = cellHeight - 1;
      const cx = x + w / 2;
      const cy = y + h / 2;

      const pulse = Math.sin(t * Math.PI);
      const scale = 1 + 0.5 * pulse;
      const alpha = (1 - t) * 0.5;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
      ctx.lineWidth = 2.5;

      const rippleW = w * scale;
      const rippleH = h * scale;
      ctx.beginPath();
      ctx.roundRect(cx - rippleW / 2, cy - rippleH / 2, rippleW, rippleH, 4);
      ctx.stroke();
      ctx.restore();

      return true;
    });
  }
}
