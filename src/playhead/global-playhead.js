// sequencer/playhead/global-playhead.js

let ctx = null;
let canvas = null;

export function initGlobalPlayhead(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
}

export function drawGlobalPlayhead(x) {
    if (!ctx || !canvas) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
  
    const lineX = Math.round(x) + 0.5; // subpixel alignment
  
    // === Crisp Core Line ===
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lineX, 0);
    ctx.lineTo(lineX, height);
    ctx.stroke();
}
  