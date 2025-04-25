// src/sequencer/grid/animation/notePlayAnimation.js

export function animateNotePlay(ctx, note, {
    getPitchRow,
    cellWidth,
    cellHeight,
    labelWidth
  }) {
    if (!ctx?.animationCtx) {
      console.warn('Missing animationCtx in animateNotePlay');
      return;
    }
  
    const x = note.start * cellWidth + labelWidth;
    const y = getPitchRow(note.pitch) * cellHeight;
    const w = note.duration * cellWidth;
    const h = cellHeight - 1;
    const cx = x + w / 2;
    const cy = y + h / 2;
  
    const midi = pitchToMidi(note.pitch);
    const hue = (midi * 5) % 360;
  
    const baseCtx = ctx.animationCtx;
    const offscreen = document.createElement('canvas');
    offscreen.width = baseCtx.canvas.width;
    offscreen.height = baseCtx.canvas.height;
    let animCtx = offscreen.getContext('2d');
  
    const startTime = performance.now();
    const duration = 300;
    const rippleCount = 2;
    const rippleDelay = 50;
  
    function drawPulse(t) {
      const pulseAlpha = Math.sin(t * Math.PI);
      const fillColor = `hsla(${hue}, 100%, 70%, ${0.4 * pulseAlpha})`;
  
      animCtx.globalAlpha = 1.0;
      animCtx.fillStyle = fillColor;
  
      animCtx.beginPath();
      animCtx.roundRect(x, y, w, h, 3);
      animCtx.fill();
    }
  
    function drawRipple(localT, scaleFactor, alphaFactor) {
      const pulse = Math.sin(localT * Math.PI);
      const scale = 1 + scaleFactor * pulse;
      const alpha = (1 - localT) * alphaFactor;
  
      animCtx.globalAlpha = alpha;
      animCtx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
      animCtx.lineWidth = 1.5;
  
      const scaledW = w * scale;
      const scaledH = h * scale;
  
      animCtx.beginPath();
      animCtx.roundRect(cx - scaledW / 2, cy - scaledH / 2, scaledW, scaledH, 4);
      animCtx.stroke();
    }
  
    function animateFrame(now) {
      const elapsed = now - startTime;
      const t = elapsed / duration;
  
      if (t > 1) {
        // Clean up reference (not strictly required, but safe practice)
        animCtx = null;
        offscreen.width = 0;
        offscreen.height = 0;
        return;
      }
  
      animCtx.clearRect(0, 0, offscreen.width, offscreen.height);
      animCtx.save();
  
      drawPulse(t);
  
      for (let i = 0; i < rippleCount; i++) {
        const rippleOffset = i * rippleDelay;
        const localT = Math.max(0, Math.min(1, (elapsed - rippleOffset) / (duration - rippleOffset)));
        drawRipple(localT, 0.1 + i * 0.1, 0.3);
      }
  
      animCtx.restore();
      
      // Composite onto main animation canvas
      baseCtx.save();
      const rippleScale = 1.3;
      const clearW = w * rippleScale + 8;
      const clearH = h * rippleScale + 8;
      baseCtx.clearRect(cx - clearW / 2, cy - clearH / 2, clearW, clearH);
      baseCtx.globalAlpha = 1.0;
      baseCtx.drawImage(offscreen, 0, 0);
      baseCtx.restore();
      
  
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
  