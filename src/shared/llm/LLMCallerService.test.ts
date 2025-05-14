/// <reference types="vitest" />

// src/shared/llm/LLMCallerService.test.ts

// npm run test -- src/shared/llm/LLMCallerService.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { callLLM } from './LLMCallerService';
import { callOpenAIModel } from '@/shared/llm/providers/openai/OpenAICallerService';

import type { LLMResponseFormat } from '@/shared/llm/interfaces/LLMInterfaces';
import type { LLMModel } from '@/shared/llm/interfaces/LLMInterfaces';
import type { Mock } from 'vitest';


// Mock callOpenAIModel
vi.mock('@/shared/llm/providers/openai/OpenAICallerService', () => ({
  callOpenAIModel: vi.fn()
}));

describe('callLLM', () => {
  const mockFormat: LLMResponseFormat = {
    name: 'test_tokens',
    schema: {
      type: 'object',
      properties: {
        result: { type: 'array', items: { type: 'string' } }
      },
      required: ['result'],
      additionalProperties: false
    }
  };

  const prompt = 'Test Prompt';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delegate to callOpenAIModel for gpt-* model', async () => {
    (callOpenAIModel as Mock).mockResolvedValueOnce(['mockToken']);

    const result = await callLLM('gpt-4o', prompt, mockFormat);

    expect(callOpenAIModel).toHaveBeenCalledWith(prompt, 'gpt-4o', mockFormat);
    expect(result).toEqual(['mockToken']);
  });

  it('should delegate to callOpenAIModel for o3-* model', async () => {
    (callOpenAIModel as Mock).mockResolvedValueOnce(['token2']);

    const result = await callLLM('o3-mini', prompt, mockFormat);

    expect(callOpenAIModel).toHaveBeenCalledWith(prompt, 'o3-mini', mockFormat);
    expect(result).toEqual(['token2']);
  });

  it('should delegate to callOpenAIModel for o4-* model', async () => {
    (callOpenAIModel as Mock).mockResolvedValueOnce(['token3']);

    const result = await callLLM('o4-giant' as LLMModel, prompt, mockFormat);

    expect(callOpenAIModel).toHaveBeenCalledWith(prompt, 'o4-giant', mockFormat);
    expect(result).toEqual(['token3']);
  });

  it('should throw for unsupported models', async () => {
    await expect(callLLM('claude-3' as LLMModel, prompt, mockFormat))
      .rejects.toThrow('Unsupported LLM model: claude-3');

    expect(callOpenAIModel).not.toHaveBeenCalled();
  });
});
