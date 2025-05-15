// src/components/aimode/interfaces/ExtractedBalancedRemiContext.ts

import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

export interface ExtractedRemiBeforeAfterContext {
  beforeRemi: RemiEvent[];
  afterRemi: RemiEvent[];
}
