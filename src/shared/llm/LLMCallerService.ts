// src/shared/llm/LLMCallerService.ts

import { callOpenAIModel } from '@/shared/llm/providers/openai/OpenAICallerService';
import type { LLMModel, LLMResponseFormat } from '@/shared/llm/interfaces/LLMInterfaces';

export async function callLLM(model: LLMModel, prompt: string, format: LLMResponseFormat): Promise<string[]> {
  if (model.startsWith('gpt-') || model.startsWith('o3') || model.startsWith('o4')) {
    return callOpenAIModel(prompt, model, format);
  }

  // Future providers: Claude, Gemini, Local LLM, etc.
  throw new Error(`Unsupported LLM model: ${model}`);
}
