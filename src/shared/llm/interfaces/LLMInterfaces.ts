// src/shared/llm/interfaces/LLMInterfaces.ts

import type { ZodTypeAny } from 'zod';
import { ModelToProvider } from '@/shared/llm/providers/profiles/ModelToProvider';

export type LLMModel = keyof typeof ModelToProvider;

export interface LLMResponseFormat<TSchema extends ZodTypeAny> {
  name: string;
  schema: TSchema;
}
