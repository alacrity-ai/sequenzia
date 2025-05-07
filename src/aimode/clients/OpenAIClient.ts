// src/aimode/clients/OpenAIClient.ts

import { getOpenAIKey, getOpenAIModel } from '../../userSettings/store/userConfigStore.js';
import { OpenAIMessage } from '../interfaces/OpenAIMessage.js';
import { OpenAISchema } from '../interfaces/OpenAISchema.js';
import { ResponseCompletionOptions } from '../interfaces/ResponseCompletionOptions.js';

const BASE_URL = 'https://api.openai.com/v1';

/*
USAGE EXAMPLE:

import OpenAIClient from '../aimode/clients/OpenAIClient.js';

const messages = [
  { role: "system", content: "You are a music composition assistant." },
  { role: "user", content: "Here is my track: { n: [[\"C4\", 0, 2]] }. Add two more notes." }
];

const schema = {
  type: 'array',
  minItems: 1,
  items: {
    type: 'object',
    properties: {
      n: {
        type: 'array',
        items: {
          type: 'array',
          prefixItems: [
            { type: 'string' },
            { type: 'number' },
            { type: 'number' }
          ],
          minItems: 3,
          maxItems: 3
        }
      }
    },
    required: ['n'],
    additionalProperties: false
  }
};

const result = await OpenAIClient.responseCompletion(messages, schema, {
  model: 'gpt-4o',
  temperature: 0.3,
  name: 'track_array'
});

console.log(result); // structured JSON
*/

class OpenAIClient {
  /**
   * Sends a structured response completion request using the Responses API.
   *
   * @param messages - Chat messages
   * @param schema - JSON Schema for structured output
   * @param options - Optional settings
   * @returns Parsed JSON response
   */
  async responseCompletion(
    messages: OpenAIMessage[],
    schema: OpenAISchema,
    options: ResponseCompletionOptions = {}
  ): Promise<any> {
    const apiKey = getOpenAIKey();
    if (!apiKey) throw new Error('OpenAI API key is not set.');

    const {
      model = getOpenAIModel(),
      name = 'structured_output',
      temperature = 0.3
    } = options;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    const body = {
      model,
      input: messages,
      text: {
        format: {
          type: 'json_schema',
          name,
          schema,
          strict: true
        }
      }
    };

    const response = await fetch(`${BASE_URL}/responses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI Responses API Error:', errorBody);
      throw new Error(`OpenAI Responses API request failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return extractOutputTextFromOpenAIResponse(json);
  }
}

/**
 * Extracts and parses the structured output from the OpenAI Responses API.
 *
 * @param json - The full OpenAI API JSON response
 * @returns Parsed structured object
 */
function extractOutputTextFromOpenAIResponse(json: any): any {
  // Step 1: Look for output entry of type "message"
  const messageBlock = json.output?.find((entry: any) => entry.type === 'message');

  // Step 2: Look inside content array of message block
  const outputTextEntry = messageBlock?.content?.find((c: any) => c.type === 'output_text');

  // Step 3: Extract raw text (if present)
  const rawText = outputTextEntry?.text;

  if (!rawText) {
    console.error('Could not find output_text in OpenAI response. Full response:', JSON.stringify(json, null, 2));
    throw new Error('OpenAI response missing structured output text.');
  }

  try {
    return typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
  } catch (err) {
    console.error('Failed to parse structured output text as JSON:', rawText);
    throw err;
  }
}

export default new OpenAIClient();
