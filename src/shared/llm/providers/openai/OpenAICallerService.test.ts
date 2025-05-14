/// <reference types="vitest" />

// src/shared/llm/providers/openai/OpenAICallerService.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { callOpenAIModel } from './OpenAICallerService';
import { z } from 'zod';

import type { Mock } from 'vitest';

// === Mocks ===
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      responses: {
        parse: vi.fn()
      }
    }))
  };
});

import OpenAI from 'openai';
import { getOpenAIKey } from '@/components/userSettings/store/userConfigStore';
import { devLog } from '@/shared/state/devMode';

vi.mock('@/components/userSettings/store/userConfigStore', () => ({
  getOpenAIKey: vi.fn()
}));

vi.mock('@/shared/state/devMode', () => ({
  devLog: vi.fn()
}));

describe('callOpenAIModel', () => {
  const TestResponseFormat = z.object({
    result: z.array(z.string())
  });

  const mockFormat = {
    name: 'test_tokens',
    schema: TestResponseFormat
  };

  const prompt = 'Test Prompt';
  const model = 'gpt-4o';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw if no API key is set', async () => {
    (getOpenAIKey as Mock).mockReturnValue(null);

    await expect(callOpenAIModel(prompt, model, mockFormat)).rejects.toThrow('OpenAI API key is not set.');
  });
});
