// src/shared/utils/musical/songUtils.ts

// Helper function to translate "X" to "X Major" or "Xm" to "X Minor"
export function formatSongKey(key: string): string {
  const isMinor = key.endsWith('m');
  const root = isMinor ? key.slice(0, -1) : key;
  return `${root} ${isMinor ? 'Minor' : 'Major'}`;
}
