// src/components/aimode/autocomplete/services/llm/promptBuilderService.ts

import { devLog } from '@/shared/state/devMode';
import { getSongKey } from '@/shared/playback/transportService.js';

import type { ExtractedContext } from '../contextExtractionService.js';
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';

function remiEventsToString(events: RemiEvent[]): string {
  return events.map(e => `${e.type} ${e.value}`).join(' ');
}

export function buildPrompt(
  context: ExtractedContext,
  continuationBeats: number = 4
): string {
  const {
    primaryTrackRemi,
    otherTracksRemi
  } = context;

  const backgroundTracksSection = otherTracksRemi
    .map((remiSeq, idx) => `Track ${idx + 1}: ${remiEventsToString(remiSeq)}`)
    .join('\n');

  const primaryTrackSection = `Primary Track: ${remiEventsToString(primaryTrackRemi)}`;

  const prompt = [
    `Song Key (M=major, m=minor): `,
    getSongKey(),
    `Background Tracks Context:`,
    backgroundTracksSection,
    ``,
    `Track to continue from:`,
    primaryTrackSection,
    ``,
    `YOU:`,
    `${continuationBeats} beat continuation of Primary Track:`
  ].join('\n');

  devLog('[AutoComplete] Generated Prompt:', prompt);

  return prompt;
}

