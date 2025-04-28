// src/export/save.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { exportSessionToJSON } from './save';
import type { AppState } from '../appState/interfaces/AppState.js';

describe('exportSessionToJSON', () => {
  // Mock URL.createObjectURL
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn((blob: Blob) => {
      (blob as any).arrayBuffer = async () => {
        const reader = new FileReader();
        return new Promise<ArrayBuffer>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as ArrayBuffer);
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });
      };
      return 'blob:http://localhost/fake-url';
    });
  });
  

  const mockAppState: AppState = {
    tempo: 120,
    timeSignature: [4, 4],
    totalMeasures: 8,
    sequencers: [
      {
        id: 0,
        instrument: 'piano',
        notes: [
          { pitch: 'C4', start: 0, duration: 1 },
          { pitch: 'E4', start: 1, duration: 1 }
        ]
      },
      {
        id: 1,
        instrument: 'drums',
        notes: [
          { pitch: 'G3', start: 2, duration: 1 }
        ]
      }
    ]
  };

  it('should export a valid session with correct structure', async () => {
    const { url, filename } = exportSessionToJSON(mockAppState);
  
    expect(url).toBe('blob:http://localhost/fake-url');
    expect(filename).toMatch(/^session-\d+\.json$/);
  
    const blobCall = (global.URL.createObjectURL as unknown as Mock).mock.calls[0][0];
    const payload = await decodeBlobURLPayload(blobCall);
  
    expect(payload.v).toBe(3);
    expect(payload.c.b).toBe(120);
    expect(payload.c.bpm).toBe(4);
    expect(payload.c.tm).toBe(8);
  
    expect(payload.i).toEqual(['piano', 'drums']);
    expect(payload.tr.length).toBe(2);
  
    expect(payload.tr[0].n).toEqual([
      ['C4', 0, 1],
      ['E4', 1, 1],
    ]);
  
    expect(payload.tr[1].n).toEqual([
      ['G3', 2, 1],
    ]);
  });

  it('should throw an error if no sequencers are present', () => {
    const emptyAppState: AppState = {
      tempo: 120,
      timeSignature: [4, 4],
      totalMeasures: 8,
      sequencers: []
    };

    expect(() => exportSessionToJSON(emptyAppState)).toThrow('No tracks to export.');
  });

  async function decodeBlobURLPayload(blob: Blob): Promise<any> {
    const buffer = await blob.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    return JSON.parse(text);
  }
});
