// src/components/sequencer/stores/sequencerStore.ts

import type Sequencer from '@/components/sequencer/sequencer.js';
import { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';
import { clearAIPreviewNotes } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore';
import { clearAutoCompleteTargetBeat } from '@/components/aimode/features/autocomplete/stores/autoCompleteStore';

const sequencers = new Map<number, Sequencer>();

let lastActiveSequencerId: number | null = null;

export function registerSequencer(id: number, sequencer: Sequencer): void {
  sequencers.set(id, sequencer);
}

export function unregisterSequencer(id: number): void {
  sequencers.delete(id);
}

export function getSequencerById(id: number): Sequencer | undefined {
  return sequencers.get(id);
}

export function getSequencers(): Sequencer[] {
  return Array.from(sequencers.values());
}

export function getLastActiveSequencerId(): number | null {
  return lastActiveSequencerId;
}

export function getLastActiveSequencer(): Sequencer | undefined {
  if (lastActiveSequencerId === null) return undefined;
  return getSequencerById(lastActiveSequencerId);
}

export function setLastActiveSequencerId(id: number | null): void {
  clearAIPreviewNotes();
  lastActiveSequencerId = id;
}

export function clearLastActiveSequencerId(): void {
  clearAIPreviewNotes();
  lastActiveSequencerId = null;
}

export function clearSequencers(): void {
  clearLastActiveSequencerId();
  sequencers.clear();
}

export function isAnySoloActive(): boolean {
  return getSequencers().some(seq => seq.solo);
}

export function rescheduleAllSequencers(): void {
  const playbackEngine = PlaybackEngine.getInstance();
  if (!playbackEngine.isActive()) return;

  const startAt = playbackEngine.getStartTime();
  const startBeat = playbackEngine.getStartBeat();

  for (const seq of getSequencers()) {
    seq.stopScheduledNotes();
    if (seq.shouldPlay) {
      void seq.reschedulePlayback(startAt, startBeat);
      void seq.resumeAnimationsFromCurrentTime(startAt, startBeat);
    }
  }
}

export function redrawAllSequencerGrids(): void {
  for (const seq of getSequencers()) {
    seq.matrix?.requestRedraw();
  }
}
