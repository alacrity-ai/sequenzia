import { RemiOutputAdapter } from '@/shared/llm/tasks/remi/adapters/remiOutputAdapter';
import type { ProviderProfile } from '@/shared/llm/providers/interfaces/ProviderProfile';

export const AnthropicProfile: ProviderProfile = {
  provider: 'anthropic',
  tasks: {
    remi: {
      schema: undefined, // Anthropic may not support structured schema here
      adapter: RemiOutputAdapter.parse
    },
    chords: {
      schema: undefined,
      adapter: (rawResult) => {
        // TODO: Implement Anthropic chords adapter logic
        return rawResult;
      }
    }
  }
};
