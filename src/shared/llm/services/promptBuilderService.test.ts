/// <reference types="vitest" />

// src/shared/llm/services/promptBuilderService.test.ts

// npm run test -- src/shared/llm/services/promptBuilderService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BasePromptBuilder } from './promptBuilderService';
import { devLog } from '@/shared/state/devMode';

// === Mock devLog ===
vi.mock('@/shared/state/devMode', () => ({
  devLog: vi.fn()
}));

// === Concrete Test Implementation ===
class TestPromptBuilder extends BasePromptBuilder<{ topic: string }, { tone: string }> {
  readonly name = 'TestBuilder';

  buildPrompt(context: { topic: string }, options: { tone: string }): string {
    const prompt = `Write about ${context.topic} in a ${options.tone} tone.`;
    this.logPrompt(prompt);
    return prompt;
  }
}

describe('BasePromptBuilder', () => {
  const builder = new TestPromptBuilder();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call logPrompt and produce the correct prompt', () => {
    const context = { topic: 'music' };
    const options = { tone: 'casual' };

    const result = builder.buildPrompt(context, options);

    expect(result).toBe('Write about music in a casual tone.');
    expect(devLog).toHaveBeenCalledWith('[TestBuilder] Generated Prompt:', 'Write about music in a casual tone.');
  });

  it('should have correct name property', () => {
    expect(builder.name).toBe('TestBuilder');
  });
});
