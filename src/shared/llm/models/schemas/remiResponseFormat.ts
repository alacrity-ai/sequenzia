// src/shared/llm/models/schemas/remiResponseFormat.ts

// Retired:
// export const remiResponseFormat = {
//   name: 'remi_tokens',
//   schema: {
//     type: 'object',
//     properties: {
//       result: {
//         type: 'array',
//         items: { type: 'string' },
//         description: 'REMI token sequence'
//       }
//     },
//     required: ['result'],
//     additionalProperties: false
//   }
// };


export const remiResponseFormat = {
  name: 'remi_tokens',
  schema: {
    type: 'object',
    properties: {
      result: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['Bar', 'Position', 'Pitch', 'Duration', 'Velocity'],
              description: 'The REMI token type'
            },
            value: {
              type: ['string', 'number'],
              description: 'The token value (Pitch is string, others are numbers)'
            }
          },
          required: ['type', 'value'],
          additionalProperties: false
        },
        description: 'REMI token sequence'
      }
    },
    required: ['result'],
    additionalProperties: false
  }
};
