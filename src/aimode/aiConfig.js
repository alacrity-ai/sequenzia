// js/aimode/aiConfig.js

export const aiContext = {
    // The maximum number of beats the AI model can "see" at once
    maxBeatsContext: 32,       // 8 measures @ 4/4 time as an example
  
    // The maximum number of tracks the model can condition on
    maxTracksContext: 8,       // e.g. 8 instrument tracks

    // The amount of beats to extend tracks by per generation
    extendBeatsAmount: 16
};
  
// Getters to ensure dynamic access to current config values
export function getMaxBeatsContext() {
    return aiContext.maxBeatsContext;
}
  
export function getMaxTracksContext() {
    return aiContext.maxTracksContext;
}

export function getExtendBeatsAmount() {
    return aiContext.extendBeatsAmount;
}
