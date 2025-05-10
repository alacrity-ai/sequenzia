// src/shared/dev/tools/index.ts

import * as sequencerTools from './sequencerTools.js';
import * as stateTools from './stateTools.js';

export function getAllDevTools(): Record<string, unknown> {
  const tools = Object.create(null);

  Object.assign(tools,
    sequencerTools,
    stateTools,
  );

  return tools;
}
