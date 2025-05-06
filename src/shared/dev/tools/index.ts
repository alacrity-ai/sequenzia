import * as sequencerTools from './sequencerTools.js';
import * as stateTools from './stateTools.js';

export function getAllDevTools(): Record<string, unknown> {
    const tools = Object.create(null); // No prototype pollution
  
    Object.assign(tools,
      sequencerTools,
      stateTools
      // ...add more as needed
    );
  
    return tools;
}
