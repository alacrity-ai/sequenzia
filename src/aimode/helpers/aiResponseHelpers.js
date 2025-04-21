/**
 * Parses a strictly formatted AI track array.
 * Assumes the OpenAI response adhered to a validated JSON Schema.
 *
 * @param {string | object} content – Raw JSON string or parsed object
 * @returns {Array<{ n: Array<[string, number, number]> }>} – Parsed track array
 * @throws {Error} if validation fails
 */
export function parseAITrackArray(content) {
    let parsed;
    
    console.log('Received the following content:')
    console.log(content)
    // Handle raw JSON string from OpenAI
    if (typeof content === 'string') {
      try {
        parsed = JSON.parse(content.trim());
      } catch (err) {
        console.error('Invalid JSON string returned from AI:', content);
        throw new Error('AI response could not be parsed as JSON.');
      }
    } else {
      parsed = content;
    }
  
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.result)) {
      throw new Error('Expected an object with a top-level "result" array.');
    }
  
    const trackArray = parsed.result.map((track, i) => {
      if (typeof track !== 'object' || !Array.isArray(track.n)) {
        throw new Error(`Track ${i} is malformed or missing "n" array.`);
      }
  
      const convertedNotes = track.n.map(note => {
        if (
          typeof note !== 'object' ||
          typeof note.p !== 'string' ||
          typeof note.s !== 'number' ||
          typeof note.d !== 'number'
        ) {
          throw new Error(`Invalid note in track ${i}: ${JSON.stringify(note)}`);
        }
  
        return [note.p, note.s, note.d];
      });
  
      return { n: convertedNotes };
    });
  
    return trackArray;
  }
  