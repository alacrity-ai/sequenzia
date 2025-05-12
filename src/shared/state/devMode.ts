import { logMessage, type LogLevel } from '@/shared/logging/logger.js';

const STORAGE_KEY = 'SEQUENZIA_DEV';

let devMode: boolean | null = null;

/**
 * Initializes devMode from localStorage (on-demand).
 */
function initDevMode(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }
  return false;
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
 * Initializes from localStorage if not yet set.
 */
export function isDevMode(): boolean {
  if (devMode === null) {
    devMode = initDevMode();
  }
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
  if (!isDevMode()) return;
  logMessage(message, data, level);
}
