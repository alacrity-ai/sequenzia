// src/shared/dev/tools/userConfigTools.ts

import { getUserConfig, updateUserConfig } from '@/components/userSettings/store/userConfigStore.js';
import { devLog } from '@/shared/state/devMode.js';

/**
 * Returns a snapshot of the current user config for inspection.
 */
export function getUserConfigSnapshot() {
  return structuredClone(getUserConfig());
}

/**
 * Sets a deeply nested property in the user config.
 * Path is dot-separated (e.g., "ai.autoCompleteContextBeats").
 * 
 * @param path - Dot-separated path to the property.
 * @param value - New value to set.
 */
export function setUserConfigProperty(path: string, value: any): void {
  const segments = path.split('.');

  if (segments.length === 0) {
    console.warn('Invalid path provided to setUserConfigProperty.');
    return;
  }

  let current: any = {};
  let target: any = current;

  // Build nested object structure to pass into updateUserConfig
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    target[segment] = {};
    target = target[segment];
  }

  const finalKey = segments[segments.length - 1];
  target[finalKey] = value;

  // Apply the partial update
  updateUserConfig(current);

  devLog(`[UserConfig] Set ${path} =`, value);
}

/**
 * Gets a deeply nested property from the user config.
 * Path is dot-separated (e.g., "ai.autoCompleteContextBeats").
 * 
 * @param path - Dot-separated path to the property.
 * @returns The value at the given path, or undefined if not found.
 */
export function getUserConfigProperty(path: string): any {
  const segments = path.split('.');
  let current: any = getUserConfig();

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      console.warn(`getUserConfigProperty: Path "${path}" not found.`);
      return undefined;
    }
  }

  return current;
}