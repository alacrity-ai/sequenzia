// src/components/aimode/autocomplete/services/llm/models/openaiCallerService.ts

import { getOpenAIKey } from "@/components/userSettings/store/userConfigStore";
import type { LLMModel } from "@/components/userSettings/interfaces/OpenAISettings";
import { devLog } from "@/shared/state/devMode";

/**
 * Calls the OpenAI Responses API for REMI Autocomplete.
 *
 * @param prompt The prompt string to send.
 * @param model The OpenAI model to use.
 * @returns The generated REMI token sequence as a string[].
 */
export async function callOpenAIModel(prompt: string, model: LLMModel): Promise<string[]> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key is not set.');

  const url = 'https://api.openai.com/v1/responses';

  const schema = {
    type: 'object',
    properties: {
      result: {
        type: 'array',
        items: { type: 'string' },
        description: 'A valid REMI token sequence. Example: ["Bar 5", "Position 0", "Pitch C4", "Duration 4", "Velocity 100"]'
      }
    },
    required: ['result'],
    additionalProperties: false
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  const body = {
    model,
    input: [{ role: 'user', content: prompt }],
    text: {
      format: {
        type: 'json_schema',
        name: 'remi_tokens',
        schema,
        strict: true
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('OpenAI Responses API Error:', errorBody);
    throw new Error(`OpenAI Responses API request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return extractRemiTokensFromOpenAIResponse(json);
}

/**
 * Safely extracts REMI token array from OpenAI Responses API output.
 *
 * @param json Full API response JSON.
 * @returns REMI tokens as string[].
 */
function extractRemiTokensFromOpenAIResponse(json: any): string[] {
  const messageBlock = json.output?.find((entry: any) => entry.type === 'message');
  const outputTextEntry = messageBlock?.content?.find((c: any) => c.type === 'output_text');
  const rawText = outputTextEntry?.text;

  devLog('[OpenAI] Raw API Response:', rawText);

  if (!rawText) {
    console.error('Missing output_text in OpenAI response. Full response:', JSON.stringify(json, null, 2));
    throw new Error('OpenAI response missing structured REMI output.');
  }

  try {
    const parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;

    if (!parsed.result || !Array.isArray(parsed.result) || (parsed.result as unknown[]).some((t): t is unknown => typeof t !== 'string')) {
      console.error('Invalid REMI token result:', parsed);
      throw new Error('OpenAI returned invalid REMI token result structure.');
    }

    devLog('[OpenAI] Parsed REMI Tokens:', parsed.result);

    return parsed.result;
  } catch (err) {
    console.error('Failed to parse REMI tokens from OpenAI response:', rawText);
    throw err;
  }
}
