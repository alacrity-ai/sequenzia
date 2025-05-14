// src/components/aimode/interfaces/ExtractedContext.ts

import { RemiEvent } from '@/shared/interfaces/RemiEvent';

export interface ExtractedRemiContext {
  primaryTrackRemi: RemiEvent[];
  otherTracksRemi: RemiEvent[][];
  startBeat: number;
  endBeat: number;
}