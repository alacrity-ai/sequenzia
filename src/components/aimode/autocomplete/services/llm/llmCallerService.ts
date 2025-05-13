// src/components/aimode/autocomplete/services/llm/llmCallerService.ts

import { callOpenAIModel } from "@/components/aimode/autocomplete/services/llm/models/openaiCallerService";
import type { LLMModel } from "@/components/userSettings/interfaces/OpenAISettings";

/**
 * Calls the appropriate LLM service based on the given model.
 *
 * @param model The LLM model to use (e.g., 'gpt-4o', 'o3-mini').
 * @param prompt The prompt string to send.
 * @returns The generated REMI token sequence as a string array.
 */
export async function callLLM(model: LLMModel, prompt: string): Promise<string[]> {
  switch (model) {
    case 'gpt-4o':
    case 'gpt-4o-mini':
    case 'gpt-4.1':
    case 'gpt-4.1-mini':
    case 'o3-mini':
    case 'o4-mini':
      return callOpenAIModel(prompt, model);

    // Future: case 'claude-3-opus': return callAnthropicModel(prompt, model);

    default:
      console.error(`Unknown LLM model: ${model}`);
      throw new Error(`Unsupported LLM model: ${model}`);
  }
}
