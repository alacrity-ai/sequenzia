// js/aimode/helpers/trackHelpers.js

/**
 * Converts an array of sequencer instances into an array of simplified track map structures.
 * 
 * @param {Array<object>} sequencers – Array of sequencer instances (each with a .notes array)
 * @returns {Array<{ n: Array<[string, number, number]> }>} – Array of track maps
 */
export function sequencersToTrackMaps(sequencers) {
    if (!Array.isArray(sequencers)) {
      throw new Error('sequencers must be an array.');
    }
  
    return sequencers.map(sequencer => {
      if (!sequencer || !Array.isArray(sequencer.notes)) {
        throw new Error('Invalid sequencer object encountered during conversion.');
      }
  
      return {
        n: sequencer.notes.map(n => [n.pitch, n.start, n.duration])
      };
    });
  }
  
/**
 * Given a track map, returns a new track map including only the notes that fall fully within
 * the specified [startBeat, endBeat) window. Notes that start before or end after the window 
 * are excluded entirely (no clipping is performed).
 * 
 * @param {{ n: Array<[string, number, number]> }} trackMap – The original track map
 * @param {number} startBeat – Inclusive start of the slice
 * @param {number} endBeat – Exclusive end of the slice
 * @returns {{ n: Array<[string, number, number]> }} – New track map containing only fully enclosed notes
 */
  export function sliceTrackMap(trackMap, startBeat, endBeat) {
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
 * Slices an array of track maps to include only notes fully within the given beat window.
 * 
 * @param {Array<{ n: Array<[string, number, number]> }>} trackMaps – Array of track maps
 * @param {number} startBeat – Inclusive start of the slice
 * @param {number} endBeat – Exclusive end of the slice
 * @returns {Array<{ n: Array<[string, number, number]> }>} – New array of sliced track maps
 */
export function sliceTracksMaps(trackMaps, startBeat, endBeat) {
    if (!Array.isArray(trackMaps)) {
      throw new Error('trackMaps must be an array.');
    }
  
    return trackMaps.map(trackMap => sliceTrackMap(trackMap, startBeat, endBeat));
  }  

 /**
 * Combines two track maps by concatenating their notes, assuming both already have correct start times.
 * No shifting or time adjustment is applied.
 * 
 * @param {{ n: Array<[string, number, number]> }} trackA – Original track
 * @param {{ n: Array<[string, number, number]> }} trackB – Track to append
 * @returns {{ n: Array<[string, number, number]> }} – Merged track map
 */
export function mergeTrackMaps(trackA, trackB) {
    if (!trackA?.n || !trackB?.n) {
      throw new Error("Invalid track maps provided.");
    }
  
    return {
      n: [...trackA.n, ...trackB.n]
    };
  }

/**
 * Merges two arrays of track maps by index (polyphonic merge).
 * Each corresponding pair of tracks is merged using `mergeTrackMaps`.
 * 
 * @param {Array<{n: Array<[string, number, number]>}>} tracksA – Base tracks
 * @param {Array<{n: Array<[string, number, number]>}>} tracksB – Tracks to append
 * @returns {Array<{n: Array<[string, number, number]>}>} – Merged track maps
 */
export function mergeTracksMaps(tracksA, tracksB) {
if (!Array.isArray(tracksA) || !Array.isArray(tracksB)) {
    throw new Error('Both track arrays must be arrays.');
}

if (tracksA.length !== tracksB.length) {
    throw new Error('Track arrays must have the same number of tracks.');
}

return tracksA.map((trackA, i) => mergeTrackMaps(trackA, tracksB[i]));
}
  