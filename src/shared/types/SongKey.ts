// src/shared/types/SongKey.ts

export type Letter = 'C' | 'C#' | 'Db' |
                     'D' | 'D#' | 'Eb' |
                     'E' | 'E#' | 'Fb' |
                     'F' | 'F#' | 'Gb' |
                     'G' | 'G#' | 'Ab' |
                     'A' | 'A#' | 'Bb' |
                     'B' | 'B#' | 'Cb';

export type Mode = 'M' | 'm';

export type SongKey = `${Letter}${Mode}`;
