// src/aimode/clients/OpenAIService.ts

import OpenAIClient from '../clients/OpenAIClient.js';
import { getOpenAIKey, getOpenAIModel } from '../../userSettings/store/userConfigStore.js';
import { parseAITrackArray } from '../helpers/aiResponseHelpers.js';
import { Track } from '../../sequencer/interfaces/Track.js';
import { OpenAIMessage } from '../interfaces/OpenAIMessage.js';
import { OpenAISchema } from '../interfaces/OpenAISchema.js';

/**
 * Requests the AI to continue the given musical tracks.
 *
 * @param tracks - Array of track maps (e.g., from sequencersToTrackMaps)
 * @param extendBeats - How many beats to extend
 * @returns Array of new note objects (AI generated)
 */
export async function extendTracks(
  tracks: Track[],
  extendBeats: number = 8
): Promise<Track[]> {
  const apiKey = getOpenAIKey();
  const model = getOpenAIModel();

  if (!apiKey || !model) {
    throw new Error('OpenAI key or model is not set in user config.');
  }

  const systemPrompt = `You are a musical AI. You receive songs as input JSON and extend the song.`;
  const userPrompt = `Extend each of the ${tracks.length} tracks by exactly ${extendBeats} beats. 
Preserve the key of the input. Develop existing motives with coherent phrasing, rhythm, and voice-leading. 
Maintain harmonic logic and linearity (e.g., Schenkerian principles). Avoid unmotivated modulations or gestures. 
Return only the new notes.

Format strictly:
Each track is an object with key "n", a list of notes.
Each note: { "p": "<pitch>", "s": <start>, "d": <duration>" }

INPUT TRACKS:
${JSON.stringify(tracks, null, 2)}`;

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const schema: OpenAISchema = {
    type: "object",
    properties: {
      result: {
        type: "array",
        items: {
          type: "object",
          properties: {
            n: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  p: { type: "string" }, // pitch
                  s: { type: "number" }, // start
                  d: { type: "number" }  // duration
                },
                required: ["p", "s", "d"],
                additionalProperties: false
              }
            }
          },
          required: ["n"],
          additionalProperties: false
        }
      }
    },
    required: ["result"],
    additionalProperties: false
  };

  try {
    const structuredOutput = await OpenAIClient.responseCompletion(messages, schema, {
      model: 'gpt-4o',
      temperature: 0.3,
      name: 'track_array'
    });

    console.log('Received response from OpenAI');
    console.log(structuredOutput);

    return parseAITrackArray(structuredOutput);
  } catch (error) {
    console.error('AI extension failed:', error);
    throw new Error('Failed to extend tracks with AI.');
  }
}
