// src/sequencer/grid/helpers/sequencerColors.ts

export const TRACK_COLORS: string[] = [
  '#ff006e', '#3a86ff', '#ffbe0b', '#8338ec', '#06d6a0',
  '#ef476f', '#118ab2', '#ffd166', '#073b4c', '#8ac926',
  '#0077b6', '#00b4d8', '#005f73', '#03045e', '#023e8a',
];

export function getTrackColor(trackId: number): string {
  // Ensure trackId is valid (non-negative)
  if (trackId < 0) {
    console.error(`Invalid trackId: ${trackId}. Using default color.`);
    trackId = 0; // Default to the first color in the array
  }
  return TRACK_COLORS[trackId % TRACK_COLORS.length];
}

export function getTrackColorFromSequencer(seq: { colorIndex: number }): string {
  if (seq && typeof seq.colorIndex === 'number') {
    return getTrackColor(seq.colorIndex);
  } else {
    console.error(`Invalid sequencer colorIndex: ${seq?.colorIndex}. Using default color.`);
    return getTrackColor(0); // Default to first color
  }
}
