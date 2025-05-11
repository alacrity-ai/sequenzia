import { describe, it, expect } from 'vitest';
import { importSessionFromJSON } from './load';
import type { Session } from '@/components/sequencer/interfaces/Session';

function createMockFileFromJSON(json: any): File {
  const jsonString = JSON.stringify(json);
  return {
    text: async () => jsonString
  } as unknown as File;
}

describe('importSessionFromJSON', () => {
  it('parses valid session data correctly', async () => {
    const json = {
      c: { b: 90, bpm: 3, tm: 16 },
      i: ['synth'],
      vlm: [0.75],
      pan: [-0.2],
      tr: [
        {
          n: [
            ['C4', 0, 1, 80],
            ['D4', 1, 1] // no velocity → should default
          ]
        }
      ]
    };

    const file = createMockFileFromJSON(json);
    const result = await importSessionFromJSON(file);

    const expected: Session = {
      globalConfig: {
        bpm: 90,
        beatsPerMeasure: 3,
        totalMeasures: 16,
        songKey: 'CM'
      },
      tracks: [
        {
          instrument: 'synth',
          volume: 0.75,
          pan: -0.2,
          notes: [
            { pitch: 'C4', start: 0, duration: 1, velocity: 80 },
            { pitch: 'D4', start: 1, duration: 1, velocity: 100 }
          ],
          config: {}
        }
      ]
    };

    expect(result).toEqual(expected);
  });

  it('throws if JSON is invalid', async () => {
    const file = {
      text: async () => '{bad json'
    } as unknown as File;

    await expect(importSessionFromJSON(file)).rejects.toThrow("Invalid JSON format.");
  });

  it('throws if `tr` array is missing or not an array', async () => {
    const file = createMockFileFromJSON({ c: {} });

    await expect(importSessionFromJSON(file)).rejects.toThrow("Missing or invalid `tr` (tracks) array.");
  });

  it('throws if a track is missing the `n` (notes) array', async () => {
    const file = createMockFileFromJSON({
      tr: [{}]
    });

    await expect(importSessionFromJSON(file)).rejects.toThrow("Track 0 missing `n` (notes) array.");
  });

  it('defaults instrument, volume, pan if missing or invalid', async () => {
    const file = createMockFileFromJSON({
      tr: [
        {
          n: [['C4', 0, 1, 100]]
        }
      ]
      // no i, vlm, or pan
    });

    const result = await importSessionFromJSON(file);

    expect(result.tracks[0].instrument).toBe('sf2/fluidr3-gm/acoustic_grand_piano');
    expect(result.tracks[0].volume).toBeUndefined();
    expect(result.tracks[0].pan).toBeUndefined();
  });
});
