// src/components/aimode/aiConfig.ts

// Define the shape of the AI context configuration
export interface AIContext {
    maxBeatsContext: number;
    maxTracksContext: number;
    extendBeatsAmount: number;
  }
  
  // Singleton instance holding the AI configuration
  export const aiContext: AIContext = {
    maxBeatsContext: 32,       // 8 measures @ 4/4 time as an example
    maxTracksContext: 8,       // e.g. 8 instrument tracks
    extendBeatsAmount: 16      // beats to extend per generation
  };
  
  // Getters to ensure dynamic access to current config values
  export function getMaxBeatsContext(): number {
    return aiContext.maxBeatsContext;
  }
  
  export function getMaxTracksContext(): number {
    return aiContext.maxTracksContext;
  }
  
  export function getExtendBeatsAmount(): number {
    return aiContext.extendBeatsAmount;
  }
  