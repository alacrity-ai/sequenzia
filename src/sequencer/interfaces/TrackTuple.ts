// src/sequencer/interfaces/TrackTuple.ts

export type NoteTuple = [string, number, number, number?];

export interface TrackTuple {
  n: NoteTuple[];
}
