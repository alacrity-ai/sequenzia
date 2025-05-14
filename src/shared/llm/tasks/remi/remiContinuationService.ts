// src/shared/llm/tasks/remi/remiContinuationService.ts

import { callLLM } from '@/shared/llm/LLMCallerService.js';
import type { LLMModel } from '@/shared/llm/interfaces/LLMInterfaces.js';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

/**
 * Gets an LLM-generated REMI continuation for the given model & prompt.
 *
 * @param model - The model to use (e.g., 'gpt-4o', 'claude-3').
 * @param prompt - The prompt to send to the LLM.
 * @returns Normalized array of RemiEvent[].
 */
export async function getRemiContinuation(
  model: LLMModel,
  prompt: string
): Promise<RemiEvent[]> {
  return callLLM<RemiEvent[]>(model, prompt, 'remi');
}
