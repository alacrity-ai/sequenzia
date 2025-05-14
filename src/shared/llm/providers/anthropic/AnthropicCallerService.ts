import { devLog } from '@/shared/state/devMode';
import type { LLMModel } from '@/shared/llm/interfaces/LLMInterfaces';

/**
 * Stubbed Anthropic model caller.
 * Simulates an API call to Claude models.
 *
 * @param prompt - The prompt string to send.
 * @param model - The Anthropic model to use (e.g., 'claude-3').
 * @returns Raw response object (to be parsed by task adapter).
 */
export async function callAnthropicModel(
  prompt: string,
  model: LLMModel
): Promise<unknown> {
  devLog('[Anthropic] Simulated call:', { model, prompt });

  // Stubbed dummy response structure
  const dummyResponse = {
    result: [
      { type: 'Bar', value: 1 },
      { type: 'Pitch', value: 'C4' },
      { type: 'Duration', value: 4 }
    ]
  };

  return dummyResponse;
}
