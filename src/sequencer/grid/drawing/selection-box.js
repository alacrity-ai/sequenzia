
import { drawRoundedRect } from './rounded-rect.js';

export function drawMarqueeSelectionBox(ctx, handlerContext) {
    const box = handlerContext.selectionBox;
    if (!box) return;
    const x1 = box.startX;
    const y1 = box.startY;
    const x2 = box.currentX;
    const y2 = box.currentY;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    ctx.save();
    ctx.strokeStyle = 'rgba(128, 90, 213, 1.0)'; // tailwind purple-500
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    drawRoundedRect(ctx, left, top, width, height, 3);
    ctx.stroke();
    ctx.restore();
}