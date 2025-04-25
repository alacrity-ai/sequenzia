// src/sequencer/animation/noteDeleteAnimation.js

export function animateNoteDeletion(ctx, note, {
    getPitchRow,
    cellWidth,
    cellHeight,
    labelWidth
  }) {
    const x = note.start * cellWidth + labelWidth;
    const y = getPitchRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;
    const cx = x + w / 2;
    const cy = y + h / 2;
  
    const midi = pitchToMidi(note.pitch);
    const baseHue = (midi * 5) % 360;
  
    const animCtx = ctx.animationCtx;
    const startTime = performance.now();
    const duration = 300;
  
    function animateFrame(now) {
      const elapsed = now - startTime;
      const t = elapsed / duration;
  
      if (t > 1) {
        animCtx.clearRect(0, 0, animCtx.canvas.width, animCtx.canvas.height);
        return;
      }
  
      animCtx.clearRect(0, 0, animCtx.canvas.width, animCtx.canvas.height);
      animCtx.save();
  
      // Fade and shrink
      const scale = 1 - 0.4 * t;
      const alpha = 1 - t;
  
      const scaledW = w * scale;
      const scaledH = h * scale;
  
      animCtx.globalAlpha = alpha;
      animCtx.fillStyle = `hsl(${baseHue}, 100%, 70%)`;
  
      animCtx.beginPath();
      animCtx.roundRect(cx - scaledW / 2, cy - scaledH / 2, scaledW, scaledH, 3);
      animCtx.fill();
  
      animCtx.restore();
      requestAnimationFrame(animateFrame);
    }
  
    requestAnimationFrame(animateFrame);
  }
  
  function pitchToMidi(pitch) {
    const match = pitch?.match?.(/^([A-G]#?)(\d)$/);
    if (!match) return null;
    const [note, oct] = match.slice(1);
    const semis = {
      C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4,
      F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11
    };
    return 12 + semis[note] + 12 * parseInt(oct, 10);
  }
  