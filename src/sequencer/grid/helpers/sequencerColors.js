// sequencer/grid/helpers/sequencerColors.js

export const TRACK_COLORS = [
    '#ff006e', '#3a86ff', '#ffbe0b', '#8338ec', '#06d6a0',
    '#ef476f', '#118ab2', '#ffd166', '#073b4c', '#8ac926'
  ];

export function getTrackColor(trackId) {
  return TRACK_COLORS[trackId % TRACK_COLORS.length];
}

export function getTrackColorFromSequencer(seq) {
  return getTrackColor(seq.colorIndex);
}
