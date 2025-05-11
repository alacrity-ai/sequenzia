import { Note } from '@/shared/interfaces/Note.js';
import { Track } from '@/components/sequencer/interfaces/Track.js';

interface AIParsedResponse {
  result: Array<{
    n: Array<{
      p: string;
      s: number;
      d: number;
    }>;
  }>;
}

/**
 * Parses a strictly formatted AI track array.
 * Assumes the OpenAI response adhered to a validated JSON Schema.
 *
 * @param content - Raw JSON string or parsed object
 * @returns Parsed track array
 * @throws Error if validation fails
 */
export function parseAITrackArray(content: string | object): Track[] {
  let parsed: any;
  
  console.log('Received the following content:');
  console.log(content);

  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content.trim()) as AIParsedResponse;
    } catch (err) {
      console.error('Invalid JSON string returned from AI:', content);
      throw new Error('AI response could not be parsed as JSON.');
    }
  } else {
    parsed = content as AIParsedResponse;
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.result)) {
    throw new Error('Expected an object with a top-level "result" array.');
  }

  const trackArray: Track[] = parsed.result.map(
    (track: { n: { p: string; s: number; d: number }[] }, i: number) => {
      if (typeof track !== 'object' || !Array.isArray(track.n)) {
        throw new Error(`Track ${i} is malformed or missing "n" array.`);
      }
  
      const convertedNotes: Note[] = track.n.map((note: { p: string; s: number; d: number }) => {
        if (
          typeof note !== 'object' ||
          typeof note.p !== 'string' ||
          typeof note.s !== 'number' ||
          typeof note.d !== 'number'
        ) {
          throw new Error(`Invalid note in track ${i}: ${JSON.stringify(note)}`);
        }
  
        return {
          pitch: note.p,
          start: note.s,
          duration: note.d,
        };
      });
  
      return { n: convertedNotes };
    }
  );  

  return trackArray;
}
