// src/components/aimode/shared/stores/llmSettingsStore.ts

import type { LLMSettings } from '@/components/aimode/interfaces/LLMSettings.js';
import { loadJSON, saveJSON } from '@/shared/utils/storage/localStorage.js';

const LOCAL_STORAGE_KEY = 'llmSettings';

const defaultLLMSettings: LLMSettings = {
  promptTuning: {
    styleInstruction: '',
    additionalInstructions: '',
    avoidStyles: ''
  },
  context: {
    useMultiTrackContext: true,
    contextBeats: 32
  }
};

let llmSettings: LLMSettings = loadJSON<LLMSettings>(LOCAL_STORAGE_KEY) ?? defaultLLMSettings;

const subscribers = new Set<() => void>();

export function getLLMSettings(): LLMSettings {
  return llmSettings;
}

export function setLLMSettings(newSettings: Partial<LLMSettings>): void {
  llmSettings = {
    ...llmSettings,
    ...newSettings,
    promptTuning: {
      ...llmSettings.promptTuning,
      ...newSettings.promptTuning
    },
    context: {
      ...llmSettings.context,
      ...newSettings.context
    }
  };

  saveJSON(LOCAL_STORAGE_KEY, llmSettings);
  subscribers.forEach(callback => callback());
}

export function subscribeLLMSettings(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
