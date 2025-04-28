// src/aimode/helpers/trackHelpers.ts

import { TrackTuple, NoteTuple } from '../../sequencer/interfaces/TrackTuple.js';

/**
 * Converts an array of sequencer instances into an array of simplified track map structures.
 */
export function sequencersToTrackMaps(sequencers: Array<{ notes: { pitch: string; start: number; duration: number }[] }>): TrackTuple[] {
  if (!Array.isArray(sequencers)) {
    throw new Error('sequencers must be an array.');
  }

  return sequencers.map((sequencer) => {
    if (!sequencer || !Array.isArray(sequencer.notes)) {
      throw new Error('Invalid sequencer object encountered during conversion.');
    }

    return {
      n: sequencer.notes.map((n) => [n.pitch, n.start, n.duration] as NoteTuple),
    };
  });
}

/**
 * Slices a track map to only notes fully inside [startBeat, endBeat).
 */
export function sliceTrackMap(trackMap: TrackTuple, startBeat: number, endBeat: number): TrackTuple {
  if (!trackMap || !Array.isArray(trackMap.n)) {
    throw new Error('Invalid trackMap provided.');
  }

  const sliced = trackMap.n.filter(([_, start, duration]) => {
    const noteEnd = start + duration;
    return start >= startBeat && noteEnd <= endBeat;
  });

  return { n: sliced };
}

/**
 * Slices an array of track maps inside [startBeat, endBeat).
 */
export function sliceTracksMaps(trackMaps: TrackTuple[], startBeat: number, endBeat: number): TrackTuple[] {
  if (!Array.isArray(trackMaps)) {
    throw new Error('trackMaps must be an array.');
  }

  return trackMaps.map((trackMap) => sliceTrackMap(trackMap, startBeat, endBeat));
}

/**
 * Merge two track maps.
 */
export function mergeTrackMaps(trackA: TrackTuple, trackB: TrackTuple): TrackTuple {
  if (!trackA?.n || !trackB?.n) {
    throw new Error('Invalid track maps provided.');
  }

  return { n: [...trackA.n, ...trackB.n] };
}

/**
 * Merge two arrays of track maps index-by-index.
 */
export function mergeTracksMaps(tracksA: TrackTuple[], tracksB: TrackTuple[]): TrackTuple[] {
  if (!Array.isArray(tracksA) || !Array.isArray(tracksB)) {
    throw new Error('Both track arrays must be arrays.');
  }

  if (tracksA.length !== tracksB.length) {
    throw new Error('Track arrays must have the same number of tracks.');
  }

  return tracksA.map((trackA, i) => mergeTrackMaps(trackA, tracksB[i]));
}
