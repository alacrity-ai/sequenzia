// src/shared/dev/tools/index.ts

import * as sequencerTools from './sequencerTools.js';
import * as stateTools from './stateTools.js';
import * as userConfigTools from './userConfigTools.js';

export function getAllDevTools(): Record<string, unknown> {
  const tools = Object.create(null);

  Object.assign(tools,
    sequencerTools,
    stateTools,
    userConfigTools
  );

  return tools;
}
