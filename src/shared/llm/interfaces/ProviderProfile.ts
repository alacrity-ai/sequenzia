// src/shared/llm/profiles/interfaces/ProviderProfile.ts

import type { LLMResponseFormat } from '@/shared/llm/interfaces/LLMInterfaces';
import type { z } from 'zod';
import type { LLMTask } from '@/shared/llm/interfaces/LLMTask';

/**
 * Defines how a provider supports a specific task.
 */
export interface TaskProfile<TSchema extends z.ZodTypeAny = z.ZodTypeAny, TOutput = unknown> {
  schema?: LLMResponseFormat<TSchema>;  // schema itself is optional
  adapter: (rawResult: unknown) => TOutput;
}

/**
 * Defines a provider's capabilities across different tasks.
 */
export interface ProviderProfile {
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  tasks: Partial<Record<LLMTask, TaskProfile<any, any>>>;
}
