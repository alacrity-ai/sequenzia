import { describe, it, expect, vi } from 'vitest';
import { extractRemiContext } from '@/components/aimode/shared/context/extractRemiContext.js';
import { remiResponseFormat } from '@/shared/llm/tasks/remi/schemas/remiResponseFormat.js';
import { ExtendFromPromptBuilder } from '@/components/aimode/features/autocomplete/prompts/ExtendFromPromptBuilder.js';
import { callLLM } from '@/shared/llm/LLMCallerService.js';

import type { LLMSettings } from '@/components/aimode/interfaces/LLMSettings.js';

// --- Mocking userConfig store for API Key ---
vi.mock('@/components/userSettings/store/userConfigStore', () => ({
  getOpenAIKey: vi.fn(() => 'sk-test-mock-api-key')
}));

function createMockLLMSettings(overrides: Partial<LLMSettings> = {}): LLMSettings {
  return {
    promptTuning: {
      styleInstruction: 'Mock Test Style',
      additionalInstructions: '',
      avoidStyles: '',
      ...(overrides.promptTuning ?? {})
    },
    context: {
      useMultiTrackContext: true,
      contextBeats: 16,
      ...(overrides.context ?? {})
    },
    ...overrides
  };
}


// --- Mocking the fetch call to OpenAI ---
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      output: [
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              text: JSON.stringify({
                result: [
                  'Position 8', 'Pitch F4', 'Duration 4', 'Velocity 90',
                  'Bar 2', 'Position 0', 'Pitch G4', 'Duration 4', 'Velocity 85',
                  'Position 4', 'Pitch F4', 'Duration 4', 'Velocity 90'
                ]
              })
            }
          ]
        }
      ]
    })
  })
) as any;

// --- Mock Sequencer structure ---
const mockSequencer = (id: number, notes: any[]) => ({
  id,
  get notes() {
    return notes;
  }
});

describe('Integration: Autocomplete LLM Flow', () => {
  it('should extract context, build prompt, call LLM, and receive REMI tokens', async () => {
    const primaryNotes = [
      { pitch: 'C4', start: 2, duration: 1, velocity: 80 },
      { pitch: 'E4', start: 5, duration: 1, velocity: 90 }
    ];

    const otherNotes1 = [
      { pitch: 'A3', start: 4, duration: 1, velocity: 70 },
      { pitch: 'B3', start: 6, duration: 1, velocity: 75 }
    ];

    const otherNotes2 = [
      { pitch: 'G3', start: 5, duration: 1, velocity: 85 }
    ];

    const sequencers = [
      mockSequencer(1, primaryNotes),
      mockSequencer(2, otherNotes1),
      mockSequencer(3, otherNotes2)
    ];

    const startBeat = 4;
    const endBeat = 8;

    // === Step 1: Extract Context ===
    const context = extractRemiContext(1, sequencers as any, startBeat, endBeat);

    expect(context.primaryTrackRemi.length).toBeGreaterThan(0);
    expect(context.otherTracksRemi.length).toBe(2);

    // === Step 2: Build Prompt ===
    const promptBuilder = new ExtendFromPromptBuilder();
    const prompt = promptBuilder.buildPrompt(context, {
      continuationBeats: 4,
      llmSettings: createMockLLMSettings()
    });
 
    expect(prompt).toContain('Primary Track:');

    // === Step 3: Call LLM ===
    const model = 'gpt-4o';
    const responseTokens = await callLLM<string[]>(model, prompt, 'remi');

    // === Step 4: Validate Response ===
    expect(Array.isArray(responseTokens)).toBe(true);
    expect(responseTokens.length).toBeGreaterThan(0);
    expect(responseTokens[0]).toMatch(/^(Bar|Position) \d+$/);
  });
});
