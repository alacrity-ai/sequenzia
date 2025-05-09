// src/globalControls/services/SaveLoadService.ts

import { getAppState } from '@/appState/appState.js';
import { exportSessionToJSON } from '@/export/save.js';
import { importSessionFromJSON } from '@/export/load.js';
import { importSessionFromMIDI } from '@/export/midi/loadFromMidi.js';
import { exportSessionToMIDI } from '@/export/midi/exportToMidi.js';
import { loadSession } from '@/export/loadSession.js';
import { exportSessionToWAV } from '@/export/save.js';
import { sequencers } from '@/sequencer/factories/SequencerFactory.js';

export class SaveLoadService {
    static async save(format: 'json' | 'midi'): Promise<void> {
    const session = getAppState();

    if (format === 'json') {
        const { url, filename } = exportSessionToJSON(session);
        SaveLoadService.download(url, filename);
    } else if (format === 'midi') {
        const { url, filename } = await exportSessionToMIDI(session);
        SaveLoadService.download(url, filename);
    } else {
        throw new Error('Unsupported export format.');
    }
    }

  static async saveWavWithOptions(options: { sampleRate: number; includePan: boolean }): Promise<void> {
    const appState = getAppState();
    try {
        const session = {
            globalConfig: {
                bpm: appState.tempo,
                beatsPerMeasure: appState.timeSignature[0],
                totalMeasures: appState.totalMeasures,
            },
            tracks: sequencers.map(seq => ({
                notes: seq.notes,
                instrument: seq.instrumentName,
                config: seq.config,
                volume: seq.volume,
                pan: seq.pan,
            }))
        };
      await exportSessionToWAV(session, options);
    } catch (err) {
      alert('Failed to export WAV: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }  

  public static async load(file: File): Promise<void> {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'json') {
        const { tracks, globalConfig } = await importSessionFromJSON(file);
        loadSession(tracks, globalConfig);
      } else if (extension === 'mid' || extension === 'midi') {
        const { tracks, globalConfig } = await importSessionFromMIDI(file);
        loadSession(tracks, globalConfig);
      } else {
        throw new Error('Unsupported file type.');
      }
    } catch (err: any) {
      alert('Failed to load file: ' + (err.message || 'Unknown error'));
    }
  }

  private static download(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
