// src/components/aimode/features/autocomplete/prompts/autoCompletePromptBuilder.ts

import { getSongKey } from '@/shared/playback/transportService.js';
import { formatSongKey } from '@/shared/utils/musical/songUtils.js';
import { BasePromptBuilder } from '@/shared/llm/services/promptBuilderService.js';

import type { LLMSettings } from '@/components/aimode/interfaces/LLMSettings';
import type { ExtractedRemiContext } from '@/components/aimode/interfaces/ExtractedRemiContext.js';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

interface AutoCompletePromptOptions {
  continuationBeats: number;
  llmSettings: LLMSettings;
}

export class AutoCompletePromptBuilder extends BasePromptBuilder<ExtractedRemiContext, AutoCompletePromptOptions> {
  readonly name = 'Remi Autocomplete Prompt';

  buildPrompt(
    context: ExtractedRemiContext,
    options: AutoCompletePromptOptions
  ): string {
    const { continuationBeats, llmSettings } = options;
    const { styleInstruction } = llmSettings.promptTuning;
    const { primaryTrackRemi, otherTracksRemi } = context;

    const remiEventsToString = (events: RemiEvent[]): string =>
      events.map(e => `${e.type} ${e.value}`).join(' ');

    const backgroundTracksSection = otherTracksRemi
      .map((remiSeq, idx) => `Track ${idx + 1}: ${remiEventsToString(remiSeq)}`)
      .join('\n');

    const primaryTrackSection = `Primary Track: ${remiEventsToString(primaryTrackRemi)}`;

    const promptLines = [
      `Song Key:`,
      formatSongKey(getSongKey()),
      ...(styleInstruction
        ? [
            '',
            `STYLE INSTRUCTION:`,
            styleInstruction
          ]
        : []),
      `Background Tracks Context (Can be empty):`,
      backgroundTracksSection,
      ``,
      `Track to continue from:`,
      primaryTrackSection,
      ``,
      `${continuationBeats} beat PRIMARY TRACK CONTINUATION:`,
    ];

    const prompt = promptLines.join('\n');

    this.logPrompt(prompt);
    return prompt;
  }
}
