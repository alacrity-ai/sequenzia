// src/components/aimode/features/autocomplete/stores/autoCompleteStore.ts

import type { Note } from '@/shared/interfaces/Note.js';

let isAutocompleteEnabled = false;
let aiPreviewNotes: Note[] = [];

const listeners = new Set<(enabled: boolean) => void>();

export function getIsAutocompleteEnabled(): boolean {
  return isAutocompleteEnabled;
}

export function setIsAutocompleteEnabled(enabled: boolean): void {
  if (isAutocompleteEnabled === enabled) return;

  isAutocompleteEnabled = enabled;
  listeners.forEach(listener => listener(isAutocompleteEnabled));
}

export function toggleIsAutocompleteEnabled(): boolean {
  isAutocompleteEnabled = !isAutocompleteEnabled;
  listeners.forEach(listener => listener(isAutocompleteEnabled));
  return isAutocompleteEnabled;
}

export function subscribeAutocompleteState(
  listener: (enabled: boolean) => void
): () => void {
  listeners.add(listener);
  // Immediately notify with current state
  listener(isAutocompleteEnabled);

  return () => listeners.delete(listener);
}

export function clearAutocompleteListeners(): void {
  listeners.clear();
}

// === API for AI Preview Notes ===
export function setAIPreviewNotes(notes: Note[]): void {
  aiPreviewNotes = notes;
}

export function getAIPreviewNotes(): Note[] {
  return aiPreviewNotes;
}

export function clearAIPreviewNotes(): void {
  aiPreviewNotes = [];
}
