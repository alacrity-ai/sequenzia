// src/shared/llm/tasks/remi/adapters/remiOutputAdapter.ts

import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import { parseRemiTokens } from '@/shared/llm/tasks/remi/parsers/parseRemiTokens.js';
import type { LLMOutputAdapter } from '@/shared/llm/interfaces/LLMOutputAdapter.js';

export const RemiOutputAdapter: LLMOutputAdapter<RemiEvent[]> = {
  parse(rawResult: unknown): RemiEvent[] {
    if (!rawResult) {
      throw new Error('REMI parse failed: result is null or undefined.');
    }

    if (Array.isArray(rawResult)) {
      return rawResult as RemiEvent[];
    }

    if (typeof rawResult === 'string') {
      return parseRemiTokens(rawResult);
    }

    throw new Error(`Unsupported REMI result type: ${typeof rawResult}`);
  }
};
