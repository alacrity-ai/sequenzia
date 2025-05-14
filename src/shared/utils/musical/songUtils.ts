// src/shared/utils/musical/songUtils.ts

/**
 * Formats a song key like "C" or "Cm" into "C Major" / "C Minor".
 * Defensively handles bad casing like "CM" or stray inputs.
 *
 * @param key - Input key string (e.g., "C", "Cm", "CM").
 * @returns Formatted string (e.g., "C Major", "A Minor").
 */
export function formatSongKey(key: string): string {
  if (!key || typeof key !== 'string') return 'Unknown Key';

  const normalized = key.trim().toUpperCase();

  // Handle "C", "CM" as "C Major"
  if (normalized === 'CM' || normalized === 'C') return 'C Major';
  if (normalized.endsWith('M') && normalized.length === 2) {
    return `${normalized[0]} Major`;
  }

  // Handle "Am" / "am" → "A Minor"
  const isMinor = key.endsWith('m') || key.endsWith('M');
  const root = key.slice(0, -1).toUpperCase();

  return `${root} ${isMinor ? 'Minor' : 'Major'}`;
}

/**
 * Converts a long-form song key ("C Major", "A Minor") into short-form ("C", "Cm").
 * Output will always be "X" for major, or "Xm" for minor.
 *
 * @param keyName - Long-form key string (e.g., "C Major", "A Minor").
 * @returns Short-form key string (e.g., "C", "Cm").
 */
export function formatSongKeyToShortName(keyName: string): string {
  if (!keyName || typeof keyName !== 'string') return '';

  const normalized = keyName.trim().toLowerCase();

  // Extract root and quality
  const match = normalized.match(/^([a-g])\s+(major|minor)$/i);
  if (!match) {
    console.warn(`formatSongKeyToShortName: Invalid key format "${keyName}"`);
    return '';
  }

  const [, root, quality] = match;

  return quality.toLowerCase() === 'minor' ? `${root.toUpperCase()}m` : root.toUpperCase();
}
