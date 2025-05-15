import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import { devLog } from '@/shared/state/devMode.js';


/**
 * Clips LLM continuation RemiEvents to only include events after a clip-after point,
 * and optionally before a clip-before point (to prevent overlap with existing notes).
 *
 * Bars are preserved only if they precede surviving Positions.
 *
 * @param llmContinuationRemi - Full LLM response RemiEvents.
 * @param clipAfterBar - Lower boundary: Clip events before this bar.
 * @param clipAfterPosition - Lower boundary: Clip events before this position in the bar.
 * @param clipBeforeBar - Optional upper boundary: Clip events at/after this bar.
 * @param clipBeforePosition - Optional upper boundary: Clip events at/after this position in the bar.
 * @returns Clipped continuation RemiEvents.
 */
export function clipRemiContinuation(
  llmContinuationRemi: RemiEvent[],
  clipAfterBar: number,
  clipAfterPosition: number,
  clipBeforeBar?: number,
  clipBeforePosition?: number
): RemiEvent[] {
  const clippedContinuation: RemiEvent[] = [];

  let currentLLMBar = 0;
  let pendingBar: RemiEvent | null = null;
  let acceptCurrentPosition = false;

  devLog('[AutoComplete] Clipping LLM Continuation:', {
    llmContinuationRemi,
    clipAfterBar,
    clipAfterPosition,
    clipBeforeBar,
    clipBeforePosition
  });

  for (const event of llmContinuationRemi) {
    if (event.type === 'Bar') {
      pendingBar = event; // Defer adding until we see an accepted Position
      currentLLMBar = event.value;
      continue;
    }

    if (event.type === 'Position') {
      const isAfterClipAfter =
        currentLLMBar > clipAfterBar ||
        (currentLLMBar === clipAfterBar && event.value >= clipAfterPosition);

      const isBeforeClipBefore =
        clipBeforeBar === undefined || clipBeforePosition === undefined ||
        currentLLMBar < clipBeforeBar ||
        (currentLLMBar === clipBeforeBar && event.value < clipBeforePosition);

      acceptCurrentPosition = isAfterClipAfter && isBeforeClipBefore;

      if (acceptCurrentPosition) {
        // Emit pending Bar if exists and not yet flushed
        if (pendingBar) {
          clippedContinuation.push(pendingBar);
          pendingBar = null;
        }
        clippedContinuation.push(event);
      }

      // If we've reached clipBefore boundary, stop processing further events
      if (
        clipBeforeBar !== undefined &&
        clipBeforePosition !== undefined &&
        !isBeforeClipBefore
      ) {
        devLog('[AutoComplete] Reached clipBefore boundary. Stopping further clipping.');
        break;
      }

      continue;
    }

    // Non-Position event (Pitch, Duration, Velocity)
    // Only emit if last Position was accepted
    if (acceptCurrentPosition) {
      clippedContinuation.push(event);
    }
  }

  devLog('[AutoComplete] Final Clipped LLM Continuation:', clippedContinuation);

  return clippedContinuation;
}
