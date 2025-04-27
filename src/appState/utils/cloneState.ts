// src/appState/utils/cloneState.ts

/**
 * Deeply clones a given object or array.
 * @param obj - The object to clone
 * @returns A new deep-cloned copy
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}
