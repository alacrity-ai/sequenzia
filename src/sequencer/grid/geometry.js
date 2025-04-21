export function pitchToMidi(pitch) {
    const match = pitch?.match?.(/^([A-G]#?)(\d)$/);
    if (!match) return null;
    const [note, oct] = match.slice(1);
    const semis = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
    return 12 + semis[note] + 12 * parseInt(oct, 10);
  }
  
  export function midiToPitch(midi) {
    const semis = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return semis[midi % 12] + (Math.floor(midi / 12) - 1);
  }
  
  export function getPitchClass(pitch) {
    return pitch.replace(/\d+$/, '');
  }
  
  export function isBlackKey(pitch) {
    return pitch.includes('#');
  }
  
  export function getRawBeatFromX(x, getCellWidth) {
    return x / getCellWidth();
  }
  
  export function getSnappedBeat(beat, config) {
    let base = config.snapResolution || 0.25;
    let snapStep = config.isTripletMode ? base * (2 / 3) : base;
    return Math.round(beat / snapStep) * snapStep;
  }
  
  export function getSnappedBeatFromX(x, config, getCellWidth) {
    const rawBeat = getRawBeatFromX(x, getCellWidth);
    return getSnappedBeat(rawBeat, config);
  }
  