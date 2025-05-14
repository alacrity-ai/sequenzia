// src/shared/llm/LLMCallerService.ts

import { callOpenAIModel } from '@/shared/llm/providers/openai/OpenAICallerService';
import type { LLMModel, LLMResponseFormat } from '@/shared/llm/interfaces/LLMInterfaces';

import type { RemiEvent } from '@/shared/interfaces/RemiEvent';

export async function callLLM(model: LLMModel, prompt: string, format: LLMResponseFormat): Promise<RemiEvent[] | string[]> {
  if (model.startsWith('gpt-') || model.startsWith('o3') || model.startsWith('o4')) {
    return callOpenAIModel(prompt, model, format);
  }

  // Future: Claude, Gemini, Local models may return string[].
  // Here you'd call their respective handlers.
  throw new Error(`Unsupported LLM model: ${model}`);
}
