import type { RemiEvent } from '@/shared/interfaces/RemiEvent';
import { devLog } from '@/shared/state/devMode';

/**
 * Normalizes AI quirks: splits compound tokens, merges type/value pairs.
 */
function normalizeTokens(rawTokens: string[]): string[] {
  const flattened: string[] = [];

  for (const token of rawTokens) {
    // Split bundled tokens with underscores (e.g., "Bar_2_Position_0")
    if (token.match(/(Bar_|Position_|Pitch_|Duration_|Velocity_)/)) {
      const parts = token.split(/(?=Bar_|Position_|Pitch_|Duration_|Velocity_)/);
      flattened.push(...parts.map(p => p.replace(/_/g, ' ').trim()).filter(Boolean));
      continue;
    }

    // Split bundled tokens with spaces (e.g., "Bar 2 Position 0")
    if (token.match(/(Bar\s|Position\s|Pitch\s|Duration\s|Velocity\s)/) && token.split(' ').length > 2) {
      const parts = token.split(/(?=Bar\s|Position\s|Pitch\s|Duration\s|Velocity\s)/);
      flattened.push(...parts.map(p => p.trim()).filter(Boolean));
      continue;
    }

    // Otherwise keep as-is
    flattened.push(token);
  }

  // Now, if tokens look like ["Bar", "1", "Position", "16"] — merge them pairwise.
  const merged: string[] = [];
  for (let i = 0; i < flattened.length; i++) {
    const typeCandidate = flattened[i];
    const valueCandidate = flattened[i + 1];

    if (valueCandidate !== undefined && !typeCandidate.includes(' ')) {
      merged.push(`${typeCandidate} ${valueCandidate}`);
      i++; // advance by 2 (skip value element next loop)
    } else {
      // Fallback: treat as standalone (best-effort)
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
