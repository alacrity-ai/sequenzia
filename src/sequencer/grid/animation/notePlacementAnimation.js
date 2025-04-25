// src/sequencer/grid/animation/notePlacementAnimation.js

export function animateNotePlacement(ctx, note, {
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
    const duration = 500;
  
    const ripples = 3;
    const rippleDelay = 60;
  
    function drawRipple(localT, radiusScale, alphaScale) {
      const pulse = Math.sin(localT * Math.PI);
      const scale = 1 + radiusScale * pulse;
      const alpha = (1 - localT) * alphaScale;
  
      animCtx.globalAlpha = alpha;
      animCtx.strokeStyle = `hsl(${baseHue}, 100%, 65%)`;
      animCtx.lineWidth = 2;
  
      const scaledW = w * scale;
      const scaledH = h * scale;
  
      animCtx.beginPath();
      animCtx.roundRect(cx - scaledW / 2, cy - scaledH / 2, scaledW, scaledH, 4);
      animCtx.stroke();
    }
  
    function drawFlash(t) {
      const flashAlpha = Math.sin(t * Math.PI); // Full at t=0.5
      const fillHue = baseHue;
      const fillColor = `hsla(${fillHue}, 100%, 80%, ${0.4 * flashAlpha})`;
  
      animCtx.globalAlpha = 1.0;
      animCtx.fillStyle = fillColor;
  
      animCtx.beginPath();
      animCtx.roundRect(x, y, w, h, 3);
      animCtx.fill();
    }
  
    function animateFrame(now) {
      const elapsed = now - startTime;
      const t = elapsed / duration;
  
      if (t > 1) {
        animCtx.clearRect(0, 0, animCtx.canvas.width, animCtx.canvas.height);
        return;
      }
  
      animCtx.clearRect(0, 0, animCtx.canvas.width, animCtx.canvas.height);
      animCtx.save();
  
      drawFlash(t); // 🌟 The inner glow flash
  
      for (let i = 0; i < ripples; i++) {
        const rippleOffset = i * rippleDelay;
        const localT = Math.max(0, Math.min(1, (elapsed - rippleOffset) / (duration - rippleOffset)));
        drawRipple(localT, 0.1 + i * 0.1, 0.2);
      }
  
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
  