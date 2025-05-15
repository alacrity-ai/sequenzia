import { remiResponseFormat } from '@/shared/llm/tasks/remi/schemas/remiResponseFormat.js';
import { RemiOutputAdapter } from '@/shared/llm/tasks/remi/adapters/remiOutputAdapter.js';
import type { ProviderProfile } from '@/shared/llm/interfaces/ProviderProfile.js';

export const OpenAIProfile: ProviderProfile = {
  provider: 'openai',
  tasks: {
    remi: {
      schema: remiResponseFormat,
      adapter: RemiOutputAdapter.parse
    },
    chords: {
      schema: undefined, // Chords task doesn't use a schema, parses raw text
      adapter: (rawResult) => {
        // TODO: Implement chords adapter logic
        return rawResult;
      }
    }
  }
};
