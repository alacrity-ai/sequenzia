// src/export/load.test.ts

import { describe, it, expect } from 'vitest';
import { importSessionFromJSON } from './load';

function createFile(content: string, name = 'session.json'): File {
    return {
      name,
      size: content.length,
      type: 'application/json',
      text: async () => content,
      slice: () => new Blob([content]),
      arrayBuffer: async () => new TextEncoder().encode(content).buffer,
      stream: () => new Blob([content]).stream(),
      lastModified: Date.now()
    } as unknown as File;
}

describe('importSessionFromJSON', () => {
  it('should import a valid session JSON correctly', async () => {
    const sessionJSON = JSON.stringify({
      c: { b: 140, bpm: 3, tm: 16 },
      i: ['fluidr3-gm/acoustic_grand_piano', 'fluidr3-gm/acoustic_bass'],
      tr: [
        { n: [['C4', 0, 1], ['D4', 1, 1]] },
        { n: [['E4', 2, 2]] }
      ]
    });

    const file = createFile(sessionJSON);
    const session = await importSessionFromJSON(file);

    expect(session.globalConfig.bpm).toBe(140);
    expect(session.globalConfig.beatsPerMeasure).toBe(3);
    expect(session.globalConfig.totalMeasures).toBe(16);

    expect(session.tracks.length).toBe(2);

    expect(session.tracks[0].notes[0]).toEqual({ pitch: 'C4', start: 0, duration: 1 });
    expect(session.tracks[1].notes[0]).toEqual({ pitch: 'E4', start: 2, duration: 2 });

    expect(session.tracks[0].instrument).toBe('fluidr3-gm/acoustic_grand_piano');
    expect(session.tracks[1].instrument).toBe('fluidr3-gm/acoustic_bass');
  });

  it('should throw error on invalid JSON', async () => {
    const invalidJSON = '{ invalid json }';
    const file = createFile(invalidJSON);

    await expect(importSessionFromJSON(file)).rejects.toThrow('Invalid JSON format.');
  });

  it('should throw error if `tr` is missing or not an array', async () => {
    const missingTrJSON = JSON.stringify({
      c: { b: 120, bpm: 4, tm: 8 },
      i: ['piano']
    });

    const file = createFile(missingTrJSON);
    await expect(importSessionFromJSON(file)).rejects.toThrow("Missing or invalid `tr` (tracks) array.");
  });

  it('should throw error if a track is missing its `n` array', async () => {
    const badTrackJSON = JSON.stringify({
      c: { b: 120, bpm: 4, tm: 8 },
      i: ['piano'],
      tr: [{}] // No `n` array
    });

    const file = createFile(badTrackJSON);
    await expect(importSessionFromJSON(file)).rejects.toThrow("Track 0 missing `n` (notes) array.");
  });

  it('should assign default instrument if missing', async () => {
    const noInstrumentJSON = JSON.stringify({
      c: { b: 120, bpm: 4, tm: 8 },
      tr: [{ n: [['C4', 0, 1]] }]
    });

    const file = createFile(noInstrumentJSON);
    const session = await importSessionFromJSON(file);

    expect(session.tracks.length).toBe(1);
    expect(session.tracks[0].instrument).toBe('fluidr3-gm/acoustic_grand_piano');
  });

  it('should handle empty notes array', async () => {
    const emptyNotesJSON = JSON.stringify({
      c: { b: 120, bpm: 4, tm: 8 },
      i: ['piano'],
      tr: [{ n: [] }]
    });

    const file = createFile(emptyNotesJSON);
    const session = await importSessionFromJSON(file);

    expect(session.tracks.length).toBe(1);
    expect(session.tracks[0].notes.length).toBe(0);
  });
});
