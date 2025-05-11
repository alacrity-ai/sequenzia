// src/shared/playback/transportService.ts

import { getSequencers } from '@/components/sequencer/factories/SequencerFactory.js';
import { getAppState, recordDiff } from '@/appState/appState.js';
import { isSnapToGridEnabled } from '../stores/songInfoStore';
import {
  createChangeTempoDiff,
  createReverseChangeTempoDiff
} from '@/appState/diffEngine/types/global/changeTempo.js';
import {
  createSetTimeSignatureDiff,
  createReverseSetTimeSignatureDiff
} from '@/appState/diffEngine/types/global/changeTimeSignature.js';
import {
  createSetTotalMeasuresDiff,
  createReverseSetTotalMeasuresDiff
} from '@/appState/diffEngine/types/global/changeMeasures.js';
import {
  createChangeSongKeyDiff,
  createReverseChangeSongKeyDiff
} from '@/appState/diffEngine/types/global/changeSongKey.js';
import { createChangeSnapResolutionDiff, 
         createReverseChangeSnapResolutionDiff 
} from '@/appState/diffEngine/types/global/changeSnapResolution.js';
import {
  createChangeNoteDurationDiff,
  createReverseChangeNoteDurationDiff
} from '@/appState/diffEngine/types/global/changeNoteDuration.js';
import {
  createSetNoteModifierModeDiff,
  createReverseSetNoteModifierModeDiff
} from '@/appState/diffEngine/types/global/setNoteModifierMode.js';

import type { SongKey } from '@/shared/types/SongKey.ts';

import { engine as playbackEngine } from '@/main.js';

let beatDuration = 500; // ms per beat
let startTime: number | null = null;
let loop = false;

export function getTotalBeats(): number {
  return getAppState().totalMeasures * getAppState().timeSignature[0];
}

export function getTempo(): number {
  return 60 / (beatDuration / 1000);
}

export function updateTempo(bpm: number, record = true): void {
  const prevBpm = getTempo();

  if (record) {
    recordDiff(
      createChangeTempoDiff(bpm),
      createReverseChangeTempoDiff(prevBpm)
    );
    return;
  }

  const now = performance.now();
  const currentBeat = playbackEngine.getCurrentBeat();
  beatDuration = (60 / bpm) * 1000;

  if (startTime !== null) {
    startTime = now - currentBeat * beatDuration;
  }

  if (playbackEngine.isActive()) {
    playbackEngine.syncAfterTempoChange(prevBpm);
  }
}

export function updateTimeSignature(beats: number, record = true): void {
  const prev = getAppState().timeSignature[0];

  if (record) {
    recordDiff(
      createSetTimeSignatureDiff(beats),
      createReverseSetTimeSignatureDiff(prev)
    );
    return;
  }

  getSequencers().forEach(seq => seq.updateBeatsPerMeasure());
}

export function updateTotalMeasures(measures: number, record = true): void {
  const prev = getAppState().totalMeasures;

  if (record) {
    recordDiff(
      createSetTotalMeasuresDiff(measures),
      createReverseSetTotalMeasuresDiff(prev)
    );
    return;
  }
}

export function updateSongKey(newKey: SongKey, record = true): void {
  const prevKey = getAppState().songKey;

  if (record) {
    recordDiff(
      createChangeSongKeyDiff(newKey),
      createReverseChangeSongKeyDiff(prevKey)
    );
  }
  return;
}

export function getSnapResolution(): number {
  if (!isSnapToGridEnabled()) {
    return 0.001;
  }
  return getAppState().snapResolution;
}

export function updateSnapResolution(value: number, record = true): void {
  const prev = getSnapResolution();

  if (record) {
    recordDiff(
      createChangeSnapResolutionDiff(value),
      createReverseChangeSnapResolutionDiff(prev)
    );
    return;
  }
}

export function updateNoteDuration(value: number, record = true): void {
  const prev = getAppState().noteDuration;

  if (record) {
    recordDiff(
      createChangeNoteDurationDiff(value),
      createReverseChangeNoteDurationDiff(prev)
    );
    return;
  }
}

export function updateNoteModifierMode(triplet: boolean, dotted: boolean, record = true): void {
  const state = getAppState();
  const prevTriplet = state.isTripletMode;
  const prevDotted = state.isDottedMode;

  if (record) {
    recordDiff(
      createSetNoteModifierModeDiff(triplet, dotted),
      createReverseSetNoteModifierModeDiff(prevTriplet, prevDotted)
    );
    return;
  }
}

export function getIsTripletMode(): boolean {
  return getAppState().isTripletMode;
}

export function getIsDottedMode(): boolean {
  return getAppState().isDottedMode;
}

export function getNoteDuration(): number {
  return getAppState().noteDuration;
}

export function getBeatDuration(): number {
  return beatDuration / 1000; // return in seconds
}

export function getTimeSignature(): number {
  return getAppState().timeSignature[0];
}

export function getTotalMeasures(): number {
  return getAppState().totalMeasures;
}

export function getSongKey(): SongKey {
  return getAppState().songKey;
}

export function setLoopEnabled(enabled: boolean): void {
  loop = enabled;
}

export function isLoopEnabled(): boolean {
  return loop;
}
