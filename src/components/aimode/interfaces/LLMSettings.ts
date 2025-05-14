// src/components/aimode/interfaces/LLMSettings.ts

export interface PromptTuningSettings {
  styleInstruction: string;
  additionalInstructions: string;
  avoidStyles: string;
}

export interface ContextSettings {
  useMultiTrackContext: boolean;
  contextBeats: number;
  // Future: forceDiatonic, etc
}

export interface LLMSettings {
  promptTuning: PromptTuningSettings;
  context: ContextSettings;
  // Future: modelPreferences, temperature, top_p,
}
