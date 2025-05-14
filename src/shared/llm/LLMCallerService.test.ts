/// <reference types="vitest" />

// src/shared/llm/LLMCallerService.test.ts

// npm run test -- src/shared/llm/LLMCallerService.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { callLLM } from './LLMCallerService';

import { callOpenAIModel } from './providers/openai/OpenAICallerService';
import { callAnthropicModel } from './providers/anthropic/AnthropicCallerService';
import { ProviderProfiles } from './providers/profiles/ProviderProfiles';

import type { LLMModel } from './interfaces/LLMInterfaces';
import type { LLMTask } from './interfaces/LLMTask';
import type { Mock } from 'vitest';

// === Mocks ===
vi.mock('./providers/openai/OpenAICallerService', () => ({
  callOpenAIModel: vi.fn()
}));

vi.mock('./providers/anthropic/AnthropicCallerService', () => ({
  callAnthropicModel: vi.fn()
}));

vi.mock('./profiles/ProviderProfiles', () => {
  const { z } = require('zod');

  return {
    ProviderProfiles: {
      openai: {
        provider: 'openai',
        tasks: {
          remi: {
            schema: { name: 'remi_tokens', schema: z.object({}) },
          }
        }
      },
      anthropic: {
        provider: 'anthropic',
        tasks: {
          remi: {
            adapter: vi.fn((input) => input)
          }
        }
      }
    }
  };
});


vi.mock('./profiles/ModelToProvider', () => ({
  ModelToProvider: {
    'gpt-4o': 'openai',
    'claude-3': 'anthropic'
  }
}));

describe('callLLM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call OpenAI flow with schema and adapter', async () => {
    (callOpenAIModel as Mock).mockResolvedValueOnce({ result: ['mockOpenAI'] });

    const result = await callLLM<string[]>('gpt-4o', 'Test Prompt', 'remi');

    expect(callOpenAIModel).toHaveBeenCalledWith(
      'Test Prompt',
      'gpt-4o',
      expect.objectContaining({
        name: 'remi_tokens',
        schema: expect.any(Object)
      })
    );

    expect(result).toEqual(['mockOpenAI']);
  });

  it('should call Anthropic flow and adapter', async () => {
    (callAnthropicModel as Mock).mockResolvedValueOnce({ result: ['mockClaude'] });

    const result = await callLLM<string[]>('claude-3', 'Claude Prompt', 'remi');

    expect(callAnthropicModel).toHaveBeenCalledWith('Claude Prompt', 'claude-3');
    expect(result).toEqual(['mockClaude']);
  });

  it('should throw if model is unknown', async () => {
    await expect(callLLM('unknown-model' as LLMModel, 'Prompt', 'remi' as LLMTask))
      .rejects.toThrow('Unknown provider for model: unknown-model');
  });

  it('should throw if task is unsupported for provider', async () => {
    await expect(callLLM('gpt-4o', 'Prompt', 'chords' as LLMTask))
      .rejects.toThrow('Task chords requires a schema for OpenAI models.');
  });

  it('should throw if OpenAI task lacks schema', async () => {
    ProviderProfiles.openai.tasks.chords = {
      schema: undefined,
      adapter: vi.fn()
    };

    await expect(callLLM('gpt-4o', 'Prompt', 'chords' as LLMTask))
      .rejects.toThrow('Task chords requires a schema for OpenAI models.');
  });
});
