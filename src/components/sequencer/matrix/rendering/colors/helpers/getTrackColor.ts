// src/components/sequencer/matrix/rendering/colors/helpers/getTrackColor.ts

import { TRACK_COLORS } from '@/components/sequencer/matrix/rendering/colors/constants/trackColors.js';

export function getTrackColor(trackId: number): string {
    // Ensure trackId is valid (non-negative)
    if (trackId < 0) {
      console.error(`Invalid trackId: ${trackId}. Using default color.`);
      trackId = 0; // Default to the first color in the array
    }
    return TRACK_COLORS[trackId % TRACK_COLORS.length];
}