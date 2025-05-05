// src/sequencer/transport.ts

import { getSequencers } from '../setup/sequencers.js';
import { recordDiff } from '../appState/appState.js';
import { createChangeTempoDiff, createReverseChangeTempoDiff } from '../appState/diffEngine/types/global/changeTempo.js';
import { createSetTimeSignatureDiff, createReverseSetTimeSignatureDiff } from '../appState/diffEngine/types/global/changeTimeSignature.js';
import { createSetTotalMeasuresDiff, createReverseSetTotalMeasuresDiff } from '../appState/diffEngine/types/global/changeMeasures.js';
import { SEQUENCER_CONFIG as config } from './constants/sequencerConstants.js';
import { engine as playbackEngine } from '../main.js';

let beatDuration: number = 500; // ms per beat
let startTime: number | null = null;
let loop: boolean = false;
let beatsPerMeasure: number = 4;
let totalMeasures: number = 8;

export function getTotalBeats(): number {
  return getTotalMeasures() * getTimeSignature();
}

export function updateTempo(bpm: number, record: boolean = true): void {
  // Record the change in tempo if requested
  const prevBpm = getTempo();

  if (record) {
    recordDiff(
      createChangeTempoDiff(bpm),
      createReverseChangeTempoDiff(prevBpm)
    );
    return;
  }

  // Update the beat duration based on the new BPM
  const now = performance.now();
  const beat = playbackEngine.getCurrentBeat();
  beatDuration = (60 / bpm) * 1000;

  // Update the start time based on the new beat duration
  if (startTime !== null) {
    startTime = now - beat * beatDuration;
  }

  if (playbackEngine.isActive()) {
    playbackEngine.syncAfterTempoChange(prevBpm);
  }  

  // Update the tempo input field
  const tempoInput = document.getElementById('tempo-input') as HTMLInputElement | null;
  if (tempoInput && tempoInput.value !== String(bpm)) {
    tempoInput.value = String(bpm);
  }
}

export function getTempo(): number {
  return 60 / (beatDuration / 1000);
}

export function updateTimeSignature(beats: number, record: boolean = true): void {
  if (record) {
    const prev = getTimeSignature();
    recordDiff(
      createSetTimeSignatureDiff(beats),
      createReverseSetTimeSignatureDiff(prev)
    );
    return;
  }

  beatsPerMeasure = beats;

  const beatsInput = document.getElementById('beats-per-measure-input') as HTMLInputElement | null;
  if (beatsInput && beatsInput.value !== String(beats)) {
    beatsInput.value = String(beats);
  }

  // LEGACY GRID:
  // getSequencers().forEach(seq => {
  //   if (seq.grid?.resizeAndRedraw) {
  //     seq.grid.resizeAndRedraw();
  //   } else {
  //     seq.grid?.scheduleRedraw();
  //   }
  // });
}

export function getTimeSignature(): number {
  return beatsPerMeasure;
}

export function updateTotalMeasures(measures: number, record: boolean = true): void {
  if (record) {
    const prev = getTotalMeasures();
    recordDiff(
      createSetTotalMeasuresDiff(measures),
      createReverseSetTotalMeasuresDiff(prev)
    );
    return;
  }

  totalMeasures = measures;

  const measuresInput = document.getElementById('measures-input') as HTMLInputElement | null;
  if (measuresInput && measuresInput.value !== String(measures)) {
    measuresInput.value = String(measures);
  }

  // LEGACY GRID:
  // getSequencers().forEach(seq => {
  //   seq.grid?.scheduleRedraw();
  // });
}

export function getTotalMeasures(): number {
  return totalMeasures;
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
