// src/components/aimode/features/autocomplete/stores/autoCompleteStore.ts

import type { Note } from '@/shared/interfaces/Note.js';

let isAutocompleteEnabled = true;
let aiPreviewNotes: Note[] = [];
let autoCompleteTargetBeat: number | null = null;
let isAutocompleteIndicatorEnabled = true;

const listeners = new Set<(enabled: boolean) => void>();

export function getAutoCompleteTargetBeat(): number | null {
  return autoCompleteTargetBeat;
}

export function setAutoCompleteTargetBeat(beat: number): void {
  autoCompleteTargetBeat = beat;
}

export function setAutoCompleteTargetBeatByNotes(notes: Note[]): void {
  if (notes.length === 0) {
    console.warn('Tried to set autocomplete target from empty note array', new Error().stack);
    clearAutoCompleteTargetBeat();
    return;
  }

  const latestEndBeat = notes.reduce((latest, note) => {
    const end = note.start + note.duration;
    return end > latest ? end : latest;
  }, -Infinity);

  if (latestEndBeat !== -Infinity) {
    setAutoCompleteTargetBeat(latestEndBeat);
  }
}

export function clearAutoCompleteTargetBeat(): void {
  autoCompleteTargetBeat = null;
}

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

// === API for AI Context Grid Indicator ===
export function setAutoCompleteTrackIndicator(enabled: boolean): void {
  isAutocompleteIndicatorEnabled = enabled;
}

export function getIsAutocompleteIndicatorEnabled(): boolean {
  return isAutocompleteIndicatorEnabled;
}
