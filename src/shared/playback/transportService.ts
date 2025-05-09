// src/shared/playback/transportService.ts

import { getSequencers } from '@/sequencer/factories/SequencerFactory.js';
import { getAppState, recordDiff } from '@/appState/appState.js';
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
import type { SongKey } from '@/shared/types/SongKey.ts';

import { SEQUENCER_CONFIG as config } from '@/sequencer/constants/sequencerConstants.js';
import { engine as playbackEngine } from '@/main.js';

let beatDuration = 500; // ms per beat
let startTime: number | null = null;
let loop = false;
let beatsPerMeasure = 4;
let totalMeasures = 8;

export function getTotalBeats(): number {
  return totalMeasures * beatsPerMeasure;
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
  const prev = beatsPerMeasure;

  if (record) {
    recordDiff(
      createSetTimeSignatureDiff(beats),
      createReverseSetTimeSignatureDiff(prev)
    );
    return;
  }

  beatsPerMeasure = beats;
  getSequencers().forEach(seq => seq.updateBeatsPerMeasure());
}

export function updateTotalMeasures(measures: number, record = true): void {
  const prev = totalMeasures;

  if (record) {
    recordDiff(
      createSetTotalMeasuresDiff(measures),
      createReverseSetTotalMeasuresDiff(prev)
    );
    return;
  }

  totalMeasures = measures;
}

export function updateSongKey(newKey: SongKey, record = true): void {
  const prevKey = getAppState().songKey;

  if (record) {
    recordDiff(
      createChangeSongKeyDiff(newKey),
      createReverseChangeSongKeyDiff(prevKey)
    );
  } else {
    // Unrecorded mutation fallback
    const state = getAppState();
    state.songKey = newKey;
  }
}

export function getBeatDuration(): number {
  return beatDuration / 1000; // return in seconds
}

export function getTimeSignature(): number {
  return beatsPerMeasure;
}

export function getTotalMeasures(): number {
  return totalMeasures;
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

export function getSnapResolution(): number {
  return config.snapResolution;
}
