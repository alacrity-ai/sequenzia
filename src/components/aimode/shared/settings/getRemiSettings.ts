// src/components/aimode/autocomplete/helpers/getRemiSettings.ts

import { getTimeSignature } from '@/shared/playback/transportService';

import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions.js';

export function getRemiSettings(): RemiEncodeOptions {
  // TODO: Fetch settings from user config or other sources
  return {
    beatsPerBar: getTimeSignature(),
    stepsPerBeat: 4,
    quantizeDurations: true,
    ignoreVelocity: true
  };
}
