import { OpenAIProfile } from '@/shared/llm/providers/openai/openaiProfile';
import { AnthropicProfile } from '@/shared/llm/providers/anthropic/anthropicProfile';
import type { ProviderProfile } from '@/shared/llm/interfaces/ProviderProfile';

/**
 * Maps provider keys to their profiles.
 */
export const ProviderProfiles: Record<string, ProviderProfile> = {
  openai: OpenAIProfile,
  anthropic: AnthropicProfile,
  // Add local, google, etc.
};
