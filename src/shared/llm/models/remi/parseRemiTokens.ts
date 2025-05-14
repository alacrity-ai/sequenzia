import type { RemiEvent } from '@/shared/interfaces/RemiEvent';
import { devLog } from '@/shared/state/devMode';

/**
 * Normalizes AI quirks: splits compound tokens, merges type/value pairs.
 */
function normalizeTokens(rawTokens: string[]): string[] {
  const flattened: string[] = [];

  for (const token of rawTokens) {
    const cleanedToken = token.trim();

    // === NEW: Handle complex underscore-compound tokens ===
    if (cleanedToken.includes('_')) {
      const underscoreTokens = extractUnderscoreTokens(cleanedToken);
      if (underscoreTokens.length > 0) {
        flattened.push(...underscoreTokens);
        continue;
      }
    }

    // === NEW: Handle pipe-separated tokens ===
    if (cleanedToken.includes('|')) {
      const pipeTokens = extractPipeSeparatedTokens(cleanedToken);
      if (pipeTokens.length > 0) {
        flattened.push(...pipeTokens);
        continue;
      }
    }

    const structuredTokens = extractStructuredTokens(token);
    if (structuredTokens.length > 0) {
      flattened.push(...structuredTokens);
      continue;
    }

    // === NEW: Handle KEY=VALUE formats (e.g., "PITCH=E7" → "Pitch E7") ===
    const equalsMatch = cleanedToken.match(/^([A-Za-z]+)=(.+)$/);
    if (equalsMatch) {
      const [, key, value] = equalsMatch;
      flattened.push(`${key.trim()} ${value.trim()}`);
      continue;
    }

    // === Existing: Handle pitch colon format (C:5) ===
    const pitchColonMatch = cleanedToken.match(/^([A-Ga-g])[:](\d)$/);
    if (pitchColonMatch) {
      const [, pitchLetter, octave] = pitchColonMatch;
      flattened.push(`Pitch ${pitchLetter.toUpperCase()}${octave}`);
      continue;
    }

    // === Existing: Handle colon-separated tokens (Bar:2) ===
    if (cleanedToken.includes(':')) {
      const colonParts = cleanedToken.split(':');
      if (colonParts.length === 2 && colonParts[0] && colonParts[1]) {
        flattened.push(`${colonParts[0].trim()} ${colonParts[1].trim()}`);
        continue;
      }
    }

    // === Existing: Handle underscore-compounds ===
    if (token.match(/(Bar_|Position_|Pitch_|Duration_|Velocity_|Pos_|Vel_|Dur_)/i)) {
      const parts = token.split(/(?=Bar_|Position_|Pitch_|Duration_|Velocity_|Pos_|Vel_|Dur_)/i);
      flattened.push(...parts.map(p => p.replace(/_/g, ' ').trim()).filter(Boolean));
      continue;
    }

    // === Existing: Handle space-compounds ===
    if (token.match(/(Bar\s|Position\s|Pitch\s|Duration\s|Velocity\s|Pos\s|Vel\s|Dur\s)/i) && token.split(' ').length > 2) {
      const parts = token.split(/(?=Bar\s|Position\s|Pitch\s|Duration\s|Velocity\s|Pos\s|Vel\s|Dur\s)/i);
      flattened.push(...parts.map(p => p.trim()).filter(Boolean));
      continue;
    }

    // === Fallback: passthrough ===
    flattened.push(cleanedToken);
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
    const token = flattened[i];
    
    // === Case 1: Token already has form "Type Value" ===
    const typeValueMatch = token.match(/^(pos|vel|dur|bar|position|pitch|duration|velocity)\s+(.+)$/i);
    if (typeValueMatch) {
      const [, rawType, rawValue] = typeValueMatch;
      const aliasResolved = TYPE_ALIASES[rawType.toLowerCase()] || null;
      const normalizedType = aliasResolved
        ? aliasResolved
        : rawType[0].toUpperCase() + rawType.slice(1).toLowerCase();
      merged.push(`${normalizedType} ${rawValue}`);
      continue;
    }

    // === Case 2: Fragmented tokens ["Bar", "2"] need merging ===
    const typeCandidate = token;
    const valueCandidate = flattened[i + 1];

    const aliasResolved = TYPE_ALIASES[typeCandidate.toLowerCase()] || null;
    const typeMatch = typeCandidate.match(/^(bar|position|pitch|duration|velocity)$/i);

    const normalizedType = aliasResolved
      ? aliasResolved
      : typeMatch
        ? typeMatch[0][0].toUpperCase() + typeMatch[0].slice(1).toLowerCase()
        : null;

    if (normalizedType && valueCandidate !== undefined) {
      merged.push(`${normalizedType} ${valueCandidate}`);
      i++; // skip value on next loop
      continue;
    }

    // === Case 3: Fallback to passthrough ===
    merged.push(token);
  }

  return merged;
}

function extractStructuredTokens(token: string): string[] {
  const results: string[] = [];

  const cleanedToken = token.trim();

  // === Try to parse CSV first ===
  const csvMatch = cleanedToken.match(/^([\d\.]+),(\d+),(\d+)/);
  if (csvMatch) {
    const [, posStr, velStr, durStr] = csvMatch;

    // Position might need scaling (beats → ticks), but for now, take as-is.
    const pos = Math.round(Number(posStr) * 16); // Example scaling: 0.0 → 0, 0.4 → 6-7, but 16 per bar tick grid assumed.
    results.push(`Position ${pos}`);
    results.push(`Velocity ${velStr}`);
    results.push(`Duration ${durStr}`);
  }

  // === If there's a comment after //, extract tokens from it ===
  const commentSplit = cleanedToken.split('//');
  if (commentSplit.length > 1) {
    const commentPart = commentSplit[1].trim();
    const subTokens = commentPart.split(',').map(s => s.trim()).filter(Boolean);
    results.push(...subTokens);
  }

  return results;
}

function extractPipeSeparatedTokens(token: string): string[] {
  const results: string[] = [];

  const parts = token.split('|').map(p => p.trim()).filter(Boolean);

  for (let i = 0; i < parts.length; i += 2) {
    const typePart = parts[i];
    const valuePart = parts[i + 1];

    if (!valuePart) continue;

    // Example: INST|MELODY should be ignored (LLM junk for now)
    if (typePart.toLowerCase() === 'track_info' || typePart.toLowerCase() === 'inst') {
      continue;
    }

    results.push(`${typePart} ${valuePart}`);
  }

  return results;
}

function extractUnderscoreTokens(token: string): string[] {
  const results: string[] = [];

  const TYPE_PREFIXES = ['bar', 'position', 'pos', 'pitch', 'duration', 'dur', 'velocity', 'vel'];

  const parts = token.split('_').filter(Boolean);

  for (let i = 0; i < parts.length - 1; i++) {
    const typeCandidate = parts[i].toLowerCase();
    const valueCandidate = parts[i + 1];

    if (TYPE_PREFIXES.includes(typeCandidate)) {
      results.push(`${typeCandidate} ${valueCandidate}`);
      i++; // skip next part since it's consumed as value
    }
  }

  return results;
}


export function parseRemiTokens(tokens: string[]): RemiEvent[] {
  const events: RemiEvent[] = [];

  const normalizedTokens = normalizeTokens(tokens);

  for (const token of normalizedTokens) {
    const match = token.match(/^(\w+)\s+(.+)$/);

    if (!match) {
      // === Fallback: orphaned numeric tokens become Duration ===
      if (/^\d+$/.test(token)) {
        events.push({ type: 'Duration', value: Number(token) } as RemiEvent);
        continue;
      }

      console.warn(`Invalid REMI token format: '${token}'`);
      continue;
    }

    const [, typeStr, valueStr] = match;
    let type = typeStr.charAt(0).toUpperCase() + typeStr.slice(1).toLowerCase();

    if (['Key', 'Inst', 'Tempo', 'Start', 'End'].includes(type)) {
      continue; // Ignore metadata tokens
    }

    // Handle LLM quirk: 'Note' should be treated as 'Pitch'
    if (type === 'Note') {
      type = 'Pitch';
    }

    switch (type as RemiEvent['type']) {
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
