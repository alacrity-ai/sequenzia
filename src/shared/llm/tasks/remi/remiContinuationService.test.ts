// src/shared/llm/tasks/remi/remiContinuationService.test.ts

// npm run test -- src/shared/llm/tasks/remi/remiContinuationService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRemiContinuation } from './remiContinuationService';
import { callLLM } from '@/shared/llm/LLMCallerService';

import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import type { Mock } from 'vitest';

// === Mocks ===
vi.mock('@/shared/llm/LLMCallerService', () => ({
  callLLM: vi.fn()
}));

describe('getRemiContinuation', () => {
  const model = 'gpt-4o';
  const prompt = 'Extend melody please';

  const expectedEvents: RemiEvent[] = [
    { type: 'Position', value: 4 },
    { type: 'Pitch', value: 'C4' },
    { type: 'Duration', value: 2 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (callLLM as Mock).mockResolvedValue(expectedEvents);
  });

  it('should call callLLM with correct arguments and return the result', async () => {
    const result = await getRemiContinuation(model, prompt);

    expect(callLLM).toHaveBeenCalledWith(model, prompt, 'remi');
    expect(result).toEqual(expectedEvents);
  });
});
