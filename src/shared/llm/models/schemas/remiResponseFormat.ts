// src/shared/llm/models/schemas/remiResponseFormat.ts

export const remiResponseFormat = {
  name: 'remi_tokens',
  schema: {
    type: 'object',
    properties: {
      result: {
        type: 'array',
        items: { type: 'string' },
        description: 'REMI token sequence'
      }
    },
    required: ['result'],
    additionalProperties: false
  }
};
