export function drawPlayhead(ctx, x, labelWidth, canvasHeight) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + labelWidth, 0);
    ctx.lineTo(x + labelWidth, canvasHeight);
    ctx.stroke();
    ctx.restore();
  }
  