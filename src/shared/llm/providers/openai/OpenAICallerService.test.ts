// src/shared/llm/providers/openai/OpenAICallerService.test.ts

// npm run test -- src/shared/llm/providers/openai/OpenAICallerService.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callOpenAIModel } from './OpenAICallerService';
import type { LLMResponseFormat } from '@/shared/llm/interfaces/LLMInterfaces';

// --- Mock getOpenAIKey ---
vi.mock('@/components/userSettings/store/userConfigStore', () => ({
  getOpenAIKey: vi.fn(() => 'mock-api-key')
}));

// --- Setup global fetch mock ---
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('callOpenAIModel', () => {
  const mockFormat: LLMResponseFormat = {
    name: 'remi_tokens',
    schema: {
      type: 'object',
      properties: {
        result: { type: 'array', items: { type: 'string' } }
      },
      required: ['result'],
      additionalProperties: false
    }
  };

  const mockResponsePayload = {
    output: [
      {
        type: 'message',
        content: [
          {
            type: 'output_text',
            text: JSON.stringify({ result: ['Bar 1', 'Position 0', 'Pitch C4'] })
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should call OpenAI API and parse tokens correctly', async () => {
    // Arrange mock fetch success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponsePayload)
    });

    // Act
    const result = await callOpenAIModel('Test Prompt', 'gpt-4o', mockFormat);

    // Assert fetch was called correctly
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const fetchCall = mockFetch.mock.calls[0][1];
    expect(fetchCall.method).toBe('POST');
    expect(fetchCall.headers['Authorization']).toBe('Bearer mock-api-key');

    // Assert body structure contains correct schema
    const body = JSON.parse(fetchCall.body);
    expect(body.model).toBe('gpt-4o');
    expect(body.text.format.name).toBe('remi_tokens');
    expect(body.text.format.schema).toEqual(mockFormat.schema);

    // Assert parsed result is correct
    expect(result).toEqual(['Bar 1', 'Position 0', 'Pitch C4']);
  });

  it('should throw if OpenAI response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request')
    });

    await expect(callOpenAIModel('Test Prompt', 'gpt-4o', mockFormat))
      .rejects.toThrow('OpenAI request failed: 400');
  });

  it('should throw if output_text is missing', async () => {
    const badPayload = {
      output: [{ type: 'message', content: [] }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(badPayload)
    });

    await expect(callOpenAIModel('Test Prompt', 'gpt-4o', mockFormat))
      .rejects.toThrow('Missing output_text in OpenAI response.');
  });

  it('should throw if result format is invalid', async () => {
    const invalidPayload = {
      output: [
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              text: JSON.stringify({ wrongField: [] })
            }
          ]
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(invalidPayload)
    });

    await expect(callOpenAIModel('Test Prompt', 'gpt-4o', mockFormat))
      .rejects.toThrow('Invalid result format.');
  });
});
