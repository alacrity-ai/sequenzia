// src/components/sequencer/matrix/rendering/colors/constants/pitchColorMap.ts

export const PITCH_COLOR_MAP: Record<string, string> = {
    'C': '#FF0000',
    'C#': '#9400D3',
    'Db': '#9400D3',
    'D': '#FFFF00',
    'D#': '#FF69B4',
    'Eb': '#FF69B4',
    'E': '#0000FF',
    'F': '#00FF00',
    'F#': '#87CEFA',
    'Gb': '#87CEFA',
    'G': '#FFA500',
    'G#': '#800080',
    'Ab': '#800080',
    'A': '#2E8B57',
    'A#': '#FFB6C1',
    'Bb': '#FFB6C1',
    'B': '#4B0082'
};

// Adjust this to map index 0–11
export const SCRIABIN_COLOR_MAP: string[] = [
    '#FF0000', // C
    '#9400D3', // C#/Db
    '#FFFF00', // D
    '#FF69B4', // D#/Eb
    '#00FF00', // E
    '#00FFFF', // F
    '#0000FF', // F#
    '#8A2BE2', // G
    '#FF8C00', // G#
    '#FFD700', // A
    '#ADFF2F', // A#/Bb
    '#DC143C'  // B
];
  