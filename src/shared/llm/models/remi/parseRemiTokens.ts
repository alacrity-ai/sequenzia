import type { RemiEvent } from '@/shared/interfaces/RemiEvent';
import { devLog } from '@/shared/state/devMode';

/**
 * Normalizes AI quirks: splits compound tokens, merges type/value pairs.
 */
function normalizeTokens(rawTokens: string[]): string[] {
  const flattened: string[] = [];

  for (const token of rawTokens) {
    // Split bundled tokens with underscores (e.g., "Bar_2_Position_0")
    if (token.match(/(Bar_|Position_|Pitch_|Duration_|Velocity_)/i)) {
      const parts = token.split(/(?=Bar_|Position_|Pitch_|Duration_|Velocity_)/i);
      flattened.push(...parts.map(p => p.replace(/_/g, ' ').trim()).filter(Boolean));
      continue;
    }

    // Split bundled tokens with spaces (e.g., "bar 2 position 0 pitch D2")
    if (token.match(/(Bar\s|Position\s|Pitch\s|Duration\s|Velocity\s)/i) && token.split(' ').length > 2) {
      const parts = token.split(/(?=Bar\s|Position\s|Pitch\s|Duration\s|Velocity\s)/i);
      flattened.push(...parts.map(p => p.trim()).filter(Boolean));
      continue;
    }

    // Otherwise keep as-is
    flattened.push(token);
  }

  // Alias map for abbreviated types
  const TYPE_ALIASES: Record<string, string> = {
    pos: 'Position',
    vel: 'Velocity',
    dur: 'Duration'
  };

  // Merge ["Bar", "1"] → "Bar 1" pairs, with type normalization & alias handling
  const merged: string[] = [];
  for (let i = 0; i < flattened.length; i++) {
    const typeCandidate = flattened[i];
    const valueCandidate = flattened[i + 1];

    // Handle aliases (e.g., "Pos" → "Position")
    const aliasMatch = typeCandidate.match(/^(pos|vel|dur)$/i);
    const aliasResolved = aliasMatch
      ? TYPE_ALIASES[aliasMatch[0].toLowerCase()]
      : null;

    const typeMatch = typeCandidate.match(/^(bar|position|pitch|duration|velocity)$/i);
    const normalizedType = aliasResolved
      ? aliasResolved
      : typeMatch
        ? typeMatch[0][0].toUpperCase() + typeMatch[0].slice(1).toLowerCase()
        : null;

    if (normalizedType && valueCandidate !== undefined) {
      merged.push(`${normalizedType} ${valueCandidate}`);
      i++; // skip value on next loop
    } else {
      merged.push(typeCandidate);
    }
  }

  return merged;
}


export function parseRemiTokens(tokens: string[]): RemiEvent[] {
  const events: RemiEvent[] = [];

  const normalizedTokens = normalizeTokens(tokens);

  for (const token of normalizedTokens) {
    const match = token.match(/^(\w+)\s+(.+)$/);

    if (!match) {
      console.warn(`Invalid REMI token format: '${token}'`);
      continue;
    }

    const [, typeStr, valueStr] = match;
    const type = typeStr as RemiEvent['type'];

    switch (type) {
      case 'Bar':
      case 'Position':
      case 'Duration':
      case 'Velocity': {
        const value = Number(valueStr);
        if (isNaN(value)) {
          console.warn(`Invalid numeric value in REMI token: '${token}'`);
          continue;
        }
        events.push({ type, value } as RemiEvent);
        break;
      }

      case 'Pitch':
        events.push({ type, value: valueStr } as RemiEvent);
        break;

      default:
        console.warn(`Unknown REMI token type: '${type}' in token '${token}'`);
        break;
    }
  }

  devLog('[RemiTokenParser] Parsed RemiEvents:', events);
  return events;
}
