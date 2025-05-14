// src/shared/llm/providers/openai/OpenAICallerService.ts

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { devLog } from '@/shared/state/devMode';
import { getOpenAIKey } from '@/components/userSettings/store/userConfigStore';

import type { LLMModel, LLMResponseFormat } from '@/shared/llm/interfaces/LLMInterfaces';
import type { z } from 'zod';

/**
 * Calls the OpenAI Responses API using Zod schema validation.
 *
 * @param prompt - The prompt string to send.
 * @param model - The OpenAI model to use (e.g., 'gpt-4o').
 * @param format - The response format (name & Zod schema).
 * @returns Parsed response typed from the schema.
 */
export async function callOpenAIModel<TSchema extends z.ZodTypeAny>(
  prompt: string,
  model: LLMModel,
  format: LLMResponseFormat<TSchema>
): Promise<z.infer<TSchema>> {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key is not set.');

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const response = await openai.responses.parse({
    model,
    input: [{ role: 'user', content: prompt }],
    text: {
      format: zodTextFormat(format.schema, format.name),
    },
  });

  devLog('[OpenAI] Raw Output:', response);

  return response.output_parsed as z.infer<TSchema>;
}
