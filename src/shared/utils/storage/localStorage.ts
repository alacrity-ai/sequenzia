// src/shared/utils/storage/localStorage.ts

export function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function saveJSON<T>(key: string, value: T): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadJSON<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null;
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error parsing localStorage key "${key}":`, err);
    return null;
  }
}

export function removeItem(key: string): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(key);
}
