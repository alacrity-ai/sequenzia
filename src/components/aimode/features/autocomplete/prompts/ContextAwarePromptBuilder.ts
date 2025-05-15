// src/components/aimode/features/autocomplete/prompts/autoCompletePromptBuilder.ts

import { getSongKey } from '@/shared/playback/transportService.js';
import { formatSongKey } from '@/shared/utils/musical/songUtils.js';
import { BasePromptBuilder } from '@/shared/llm/services/promptBuilderService.js';

import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import type { LLMSettings } from '@/components/aimode/interfaces/LLMSettings';
import type { ExtractedRemiBeforeAfterContext } from '@/components/aimode/interfaces/ExtractedRemiBeforeAfterContext.js';

interface AutoCompletePromptOptions {
  continuationBeats: number;
  llmSettings: LLMSettings;
}


export class ContextAwarePromptBuilder extends BasePromptBuilder<ExtractedRemiBeforeAfterContext, AutoCompletePromptOptions> {
  readonly name = 'Remi Context Aware Autocomplete Prompt';

  buildPrompt(
    context: ExtractedRemiBeforeAfterContext,
    options: AutoCompletePromptOptions
  ): string {
    const { continuationBeats, llmSettings } = options;
    const { styleInstruction } = llmSettings.promptTuning;
    const { beforeRemi, afterRemi } = context;

    const remiEventsToString = (events: RemiEvent[]): string =>
      events.map(e => `${e.type} ${e.value}`).join(' ');

    const promptLines = [
      `Song Key:`,
      formatSongKey(getSongKey()),
      ...(styleInstruction ? [``, `STYLE INSTRUCTION:`, styleInstruction] : []),
      `Earlier section of song:`,
      beforeRemi.length > 0 ? remiEventsToString(beforeRemi) : '(empty)',
      ``,
      `Later section of song:`,
      afterRemi.length > 0 ? remiEventsToString(afterRemi) : '(empty)',
      ``,
      `${continuationBeats} beat CONTINUATION:`
    ];

    const prompt = promptLines.join('\n');
    this.logPrompt(prompt);
    return prompt;
  }
}
