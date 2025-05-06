// src/shared/state/devMode.ts

import { logMessage, type LogLevel } from '../logging/logger.js';

const STORAGE_KEY = 'SEQUENZIA_DEV';

let devMode = false;

// Initialize devMode from localStorage (only runs once on import)
if (typeof window !== 'undefined') {
  devMode = localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Enables developer mode and persists it in localStorage.
 */
export function enableDevMode(): void {
  devMode = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, 'true');
  }
}

/**
 * Disables developer mode and removes it from localStorage.
 */
export function disableDevMode(): void {
  devMode = false;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Returns whether developer mode is currently enabled.
 */
export function isDevMode(): boolean {
  return devMode;
}

/**
 * Logs a message only if dev mode is enabled.
 */
export function devLog(
  message: string,
  data?: unknown,
  level: LogLevel = 'log'
): void {
  if (!devMode) return;
  logMessage(message, data, level);
}
