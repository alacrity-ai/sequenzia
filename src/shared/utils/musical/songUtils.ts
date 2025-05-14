// src/shared/utils/musical/songUtils.ts

/**
 * Formats a song key like "C", "Cm", or "CM" into "C Major" / "C Minor".
 * Defensively handles bad casing and stray inputs.
 *
 * @param key - Input key string (e.g., "C", "Cm", "CM").
 * @returns Formatted string (e.g., "C Major", "C Minor", "C Major").
 */
export function formatSongKey(key: string): string {
  if (!key || typeof key !== 'string' || !key.trim()) {
    return 'Unknown Key';
  }

  const trimmed = key.trim();
  
  // Check if the key is just a single character (e.g., "C")
  if (trimmed.length === 1) {
    return `${trimmed.toUpperCase()} Major`;
  }
  
  // For keys like "Cm" or "CM"
  const lastChar = trimmed.slice(-1);
  const root = trimmed.slice(0, -1);
  
  if (!root) return 'Unknown Key';
  
  if (lastChar === 'm') {
    return `${root.toUpperCase()} Minor`;
  } else {
    return `${root.toUpperCase()} Major`;
  }
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
