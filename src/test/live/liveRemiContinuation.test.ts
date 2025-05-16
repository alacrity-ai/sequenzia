// test\live\liveLLMAutocompleteFlow.test.ts

// npm run test:live -- src/test/live/liveLLMAutocompleteFlow.test.ts

import { describe, it, expect, vi } from 'vitest';
import * as dotenv from 'dotenv';

import { RemiOutputAdapter } from '@/shared/llm/tasks/remi/adapters/remiOutputAdapter';

import type { LLMSettings } from '@/components/aimode/interfaces/LLMSettings.js';


// === Load .env (VITE_OPENAI_API_KEY) ===
dotenv.config();

if (!process.env.VITE_OPENAI_API_KEY) {
  throw new Error('Missing VITE_OPENAI_API_KEY in .env file');
}

// === Mock getOpenAIKey to return env value ===
vi.mock('@/components/userSettings/store/userConfigStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/userSettings/store/userConfigStore')>();
  return {
    ...actual,
    getOpenAIKey: () => process.env.VITE_OPENAI_API_KEY!
  };
});

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

// === Now safe to import modules ===
import { extractRemiContext } from '@/components/aimode/shared/context/extractRemiContext';
import { clipRemiContinuation } from '@/shared/llm/tasks/remi/helpers/clipRemiContinuation';
import { ExtendFromPromptBuilder } from '@/components/aimode/features/autocomplete/prompts/ExtendFromPromptBuilder';
import { callLLM } from '@/shared/llm/LLMCallerService';
import { remiResponseFormat } from '@/shared/llm/tasks/remi/schemas/remiResponseFormat';

import type { Note } from '@/shared/interfaces/Note.js';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions.js';

// === Mock Sequencer Factory ===
const mockSequencer = (id: number, notes: Note[]) => ({
  id,
  get notes() {
    return notes;
  }
});

describe('Live Integration: Full Continuation Flow', () => {
  it('should produce a correctly clipped continuation from live LLM call', async () => {
    const remiSettings: RemiEncodeOptions = {
      beatsPerBar: 4,
      stepsPerBeat: 4,
      quantizeDurations: true,
      ignoreVelocity: false
    };

    const primaryNotes = [
      { pitch: 'C4', start: 0, duration: 1, velocity: 85 },
      { pitch: 'E4', start: 1, duration: 1, velocity: 90 },
      { pitch: 'G4', start: 2, duration: 1, velocity: 90 },
      { pitch: 'A4', start: 3, duration: 1, velocity: 88 },
      { pitch: 'G4', start: 4, duration: 1, velocity: 90 },
      { pitch: 'E4', start: 5, duration: 1, velocity: 85 },
      { pitch: 'C4', start: 6, duration: 1, velocity: 80 }
    ];

    const otherNotes1 = [
      { pitch: 'C3', start: 0, duration: 2, velocity: 70 },
      { pitch: 'F3', start: 2, duration: 2, velocity: 72 },
      { pitch: 'G3', start: 4, duration: 2, velocity: 75 },
      { pitch: 'F3', start: 6, duration: 2, velocity: 72 },
      { pitch: 'E3', start: 8, duration: 2, velocity: 70 }
    ];

    const otherNotes2 = [
      { pitch: 'C2', start: 0, duration: 2, velocity: 80 },
      { pitch: 'C2', start: 2, duration: 2, velocity: 80 },
      { pitch: 'G2', start: 4, duration: 2, velocity: 85 },
      { pitch: 'C2', start: 6, duration: 2, velocity: 80 }
    ];

    const sequencers = [
      mockSequencer(1, primaryNotes),
      mockSequencer(2, otherNotes1),
      mockSequencer(3, otherNotes2)
    ];

    const startBeat = 4;
    const endBeat = 8;

    // === Extract Context ===
    const context = extractRemiContext(1, sequencers as any, startBeat, endBeat, remiSettings);

    expect(context.primaryTrackRemi.length).toBeGreaterThan(0);
    expect(context.otherTracksRemi.length).toBe(2);

    // === Build Prompt ===
    const promptBuilder = new ExtendFromPromptBuilder();
    const prompt = promptBuilder.buildPrompt(context, {
      continuationBeats: 4,
      llmSettings: createMockLLMSettings()
    });

    // === Call LLM ===
    const model = 'gpt-4o';
    const rawRemiResult = await callLLM<unknown>(model, prompt, 'remi');

    // === Convert raw result into RemiEvents ===
    const llmContinuationRemi: RemiEvent[] = RemiOutputAdapter.parse(rawRemiResult);

    // === Compute Clip Boundary from endBeat ===
    const clipAfterBar = Math.floor(endBeat / remiSettings.beatsPerBar!);
    const clipAfterPosition = (endBeat % remiSettings.beatsPerBar!) * remiSettings.stepsPerBeat!;

    // === Clip Continuation ===
    const clippedContinuation = clipRemiContinuation(llmContinuationRemi, clipAfterBar, clipAfterPosition);

    // === Validate Structure ===
    for (const event of clippedContinuation) {
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('value');
    }

    // Ensure Positions are monotonically increasing within each Bar
    let currentBar = -1;
    let lastPosition = -1;

    for (const event of clippedContinuation) {
      if (event.type === 'Bar') {
        currentBar = event.value;
        lastPosition = -1;
      }
      if (event.type === 'Position') {
        expect(typeof event.value).toBe('number');
        expect(event.value).toBeGreaterThanOrEqual(0);
        expect(event.value).toBeGreaterThan(lastPosition);
        lastPosition = event.value;
      }
    }
  }, 30000);
});
