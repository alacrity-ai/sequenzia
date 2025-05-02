// src/sequencer/grid/helpers/redraw.ts (or similar)

import { HandlerContext } from '../../../interfaces/HandlerContext.js';

const redrawMap = new WeakMap<HandlerContext, boolean>();

export function queueRedraw(ctx: HandlerContext): void {
  if (redrawMap.get(ctx)) return;

  redrawMap.set(ctx, true);
  requestAnimationFrame(() => {
    redrawMap.set(ctx, false);
    ctx.scheduleRedraw();
  });
}
