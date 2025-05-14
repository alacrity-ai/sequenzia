// src/shared/llm/LLMCallerService.ts

import { ProviderProfiles } from '@/shared/llm/providers/profiles/ProviderProfiles.js';
import { ModelToProvider } from '@/shared/llm/providers/profiles/ModelToProvider.js';
import { callOpenAIModel } from '@/shared/llm/providers/openai/OpenAICallerService.js';
import { callAnthropicModel } from '@/shared/llm/providers/anthropic/AnthropicCallerService.js';
// To add more models: Add local, google as needed

import type { LLMModel } from '@/shared/llm/interfaces/LLMInterfaces';
import type { LLMTask } from '@/shared/llm/interfaces/LLMTask';

function hasResultProperty(obj: unknown): obj is { result: unknown } {
  return typeof obj === 'object' && obj !== null && 'result' in obj;
}

/**
 * Unified LLM caller for Sequenzia.
 * Resolves correct provider logic, schema usage, and adapters per task.
 */
export async function callLLM<TOutput>(
  model: LLMModel,
  prompt: string,
  task: LLMTask
): Promise<TOutput> {
  const providerKey = ModelToProvider[model];
  if (!providerKey) throw new Error(`Unknown provider for model: ${model}`);

  const profile = ProviderProfiles[providerKey];
  const taskProfile = profile.tasks[task];
  if (!taskProfile) throw new Error(`Provider ${profile.provider} does not support task: ${task}`);

  let rawResult: unknown;

  switch (profile.provider) {
    case 'openai':
      if (!taskProfile.schema) throw new Error(`Task ${task} requires a schema for OpenAI models.`);
      rawResult = await callOpenAIModel(prompt, model, taskProfile.schema);
      break;

    case 'anthropic':
      rawResult = await callAnthropicModel(prompt, model);
      break;

    // other providers...

    default:
      throw new Error(`Provider ${profile.provider} not implemented.`);
  }

  const resultToParse = hasResultProperty(rawResult) ? rawResult.result : rawResult;

  return taskProfile.adapter(resultToParse) as TOutput;
}
