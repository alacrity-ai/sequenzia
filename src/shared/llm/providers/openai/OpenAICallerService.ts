// src/shared/llm/providers/openai/OpenAICallerService.ts

import { devLog } from '@/shared/state/devMode';
import { getOpenAIKey } from '@/components/userSettings/store/userConfigStore';

import type { LLMModel, LLMResponseFormat } from '@/shared/llm/interfaces/LLMInterfaces';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent';

export async function callOpenAIModel(prompt: string, model: LLMModel, format: LLMResponseFormat): Promise<RemiEvent[]> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key is not set.');

  const url = 'https://api.openai.com/v1/responses';
  const schema = format.schema;

  const body = {
    model,
    input: [{ role: 'user', content: prompt }],
    text: {
      format: {
        type: 'json_schema',
        name: format.name,
        schema,
        strict: true
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('OpenAI Responses API Error:', errorBody);
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const json = await response.json();
  return extractTokensFromResponse(json);
}

function extractTokensFromResponse(json: any): RemiEvent[] {
  const message = json.output?.find((entry: any) => entry.type === 'message');
  const output = message?.content?.find((c: any) => c.type === 'output_text')?.text;

  devLog('[OpenAI] Raw Output:', output);

  if (!output) throw new Error('Missing output_text in OpenAI response.');

  const parsed = JSON.parse(output);

  if (!Array.isArray(parsed.result)) {
    throw new Error('Invalid result format.');
  }

  // Strongly typed RemiEvent array now
  const result: RemiEvent[] = parsed.result;

  return result;
}

