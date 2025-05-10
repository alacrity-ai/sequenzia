// src/globalControls/constants.ts

export const GLOBAL_CONFIG_CONTROLS_WIDTH: string = 'w-[1260px]';

/**
 * Fixed width (in pixels) for the global mini contour and playhead canvases.
 * This must match the Tailwind class w-[1100px] applied in UI layout.
 */
export const GLOBAL_TRANSPORT_CANVAS_WIDTH: number = 1100;


/**
 * Common musical resolution options (used for note durations and snapping).
 */
export const NOTE_RESOLUTION_OPTIONS = [
    { value: '4', label: '𝅝', title: 'Whole Note' },
    { value: '2', label: '𝅗𝅥', title: 'Half Note' },
    { value: '1', label: '𝅘𝅥', title: 'Quarter Note' },
    { value: '0.5', label: '♪', title: 'Eighth Note' },
    { value: '0.25', label: '♬', title: 'Sixteenth Note' },
    { value: '0.125', label: '𝅘𝅥𝅰', title: '32nd Note' }
  ];