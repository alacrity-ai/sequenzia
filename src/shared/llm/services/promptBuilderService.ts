// src/shared/llm/services/promptBuilderService.ts

import { devLog } from '@/shared/state/devMode';

export interface PromptBuilder<ContextType, OptionsType = void> {
  readonly name: string;
  buildPrompt(context: ContextType, options: OptionsType): string;
}


export abstract class BasePromptBuilder<ContextType, OptionsType = void> implements PromptBuilder<ContextType, OptionsType> {
  abstract readonly name: string;
  abstract buildPrompt(context: ContextType, options: OptionsType): string;

  protected logPrompt(prompt: string): void {
    devLog(`[${this.name}] Generated Prompt:`, prompt);
  }
}
