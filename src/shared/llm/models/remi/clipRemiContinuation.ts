import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import { devLog } from '@/shared/state/devMode.js';

/**
 * Clips LLM continuation RemiEvents to only include events after the given clip point (Bar, Position).
 *
 * Bars are preserved only if they precede surviving Positions.
 *
 * @param llmContinuationRemi - Full LLM response RemiEvents.
 * @param clipAfterBar - Clip point Bar.
 * @param clipAfterPosition - Clip point Position within the bar.
 * @returns Clipped continuation RemiEvents.
 */
export function clipRemiContinuation(
  llmContinuationRemi: RemiEvent[],
  clipAfterBar: number,
  clipAfterPosition: number
): RemiEvent[] {
  const clippedContinuation: RemiEvent[] = [];

  let currentLLMBar = 0;
  let pendingBar: RemiEvent | null = null;
  let acceptCurrentPosition = false;

  devLog('[AutoComplete] Clipping LLM Continuation:', {
    llmContinuationRemi,
    clipAfterBar,
    clipAfterPosition
  });

  for (const event of llmContinuationRemi) {
    if (event.type === 'Bar') {
      pendingBar = event; // Defer adding until we see an accepted Position
      currentLLMBar = event.value;
      continue;
    }

    if (event.type === 'Position') {
      const shouldAccept =
        currentLLMBar > clipAfterBar ||
        (currentLLMBar === clipAfterBar && event.value >= clipAfterPosition);

      acceptCurrentPosition = shouldAccept;

      if (acceptCurrentPosition) {
        // Emit pendingBar if exists and not yet flushed
        if (pendingBar) {
          clippedContinuation.push(pendingBar);
          pendingBar = null;
        }
        clippedContinuation.push(event);
      }

      continue; // Next event
    }

    // Non-Position event (Pitch, Duration, Velocity)
    // Only emit if last Position was accepted
    if (acceptCurrentPosition) {
      clippedContinuation.push(event);
    }
  }

  devLog('[AutoComplete] Clipped LLM Continuation:', clippedContinuation);

  return clippedContinuation;
}