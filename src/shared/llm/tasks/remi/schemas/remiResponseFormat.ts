// src/shared/llm/tasks/schemas/remiResponseFormat.ts

import { z } from 'zod';
import type { LLMResponseFormat } from '@/shared/llm/interfaces/LLMInterfaces';

/**
 * Defines a single REMI token.
 */
export const RemiToken = z.object({
  type: z.enum(['Bar', 'Position', 'Pitch', 'Duration', 'Velocity'], {
    description: 'The REMI token type',
  }),
  value: z.union([z.string(), z.number()], {
    description: 'The token value (Pitch is string, others are numbers)',
  }),
});

/**
 * Defines the REMI response format structure.
 */
export const RemiResponseFormat = z.object({
  result: z.array(RemiToken, {
    description: 'REMI token sequence',
  }),
});

/**
 * Inferred TS type for REMI response format.
 */
export type RemiResponseFormatType = z.infer<typeof RemiResponseFormat>;

/**
 * Exported in LLMResponseFormat structure.
 */
export const remiResponseFormat: LLMResponseFormat<typeof RemiResponseFormat> = {
  name: 'remi_tokens',
  schema: RemiResponseFormat,
};
