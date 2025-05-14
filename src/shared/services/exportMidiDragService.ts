// src/components/sequencer/services/exportMidiDragService.ts

import { devLog } from '@/shared/state/devMode';
import { exportMidiFromSequencers } from '@/export/midi/exportToMidi.js';

import type Sequencer from '@/components/sequencer/sequencer.js';

/**
 * Handles dragstart event to export a single sequencer as a MIDI file drag item.
 */
export function handleMidiDragStart(e: DragEvent, sequencers: Sequencer[]): () => void {
  const { filename, blob } = exportMidiFromSequencers(sequencers);
  const url = URL.createObjectURL(blob);

  if (e.dataTransfer) {
    e.dataTransfer.clearData();
    e.dataTransfer.setData('DownloadURL', `audio/midi:${filename}:${url}`);
    e.dataTransfer.effectAllowed = 'copy';

    const dragIcon = document.createElement('div');
    dragIcon.textContent = filename;
    dragIcon.style.padding = '10px 16px';
    dragIcon.style.background = '#000000';
    dragIcon.style.color = '#ffffff';
    dragIcon.style.fontFamily = 'sans-serif';
    dragIcon.style.fontSize = '12px';
    dragIcon.style.border = '1px solid #555';
    dragIcon.style.borderRadius = '6px';
    dragIcon.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.5)';
    dragIcon.style.position = 'absolute';
    dragIcon.style.top = '-1000px';
    dragIcon.style.pointerEvents = 'none';
    document.body.appendChild(dragIcon);

    e.dataTransfer.setDragImage(dragIcon, 0, 0);

    devLog(`[ExportMidiDrag] dataTransfer populated with MIDI file via DownloadURL`);

    // === Return cleanup function ===
    return () => {
      devLog(`[ExportMidiDrag] cleaning up URL and drag image`);

      // Safely defer URL revocation to avoid breaking file drop
      setTimeout(() => {
        URL.revokeObjectURL(url);
        devLog(`[ExportMidiDrag] URL revoked: ${url}`);
      }, 100);

      // Immediate DOM cleanup for dragIcon (safe)
      if (dragIcon.parentNode) {
        dragIcon.parentNode.removeChild(dragIcon);
      }
    };
  } else {
    console.warn('Drag event has no dataTransfer');
    return () => {};
  }
}
