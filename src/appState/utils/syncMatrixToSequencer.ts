// src/appState/utils/syncLiveMatrixWithSerializedNotes.ts

import { PlaybackEngine } from '@/shared/playback/PlaybackEngine.js';

import type { Note } from '@/shared/interfaces/Note.js';
import type { Grid } from '@/components/sequencer/matrix/Grid.js';
import type { InteractionStore } from '@/components/sequencer/matrix/input/stores/InteractionStore.js';
import type Sequencer from '@/components/sequencer/sequencer.js';

export function syncLiveMatrixWithSerializedNotes(
  matrix: Grid,
  serializedNotes: Note[],
  sequencer: Sequencer,
  preserveSelection = true
): void {
  const interactionStore: InteractionStore = matrix.getInteractionStore();

  let prevNoteHashes = new Set<string>();
  if (preserveSelection) {
    const prevSelectedNotes = interactionStore.getSelectedNotes();
    prevNoteHashes = new Set(prevSelectedNotes.map(n =>
      `${n.pitch}:${n.start}:${n.duration}:${n.velocity}`
    ));
  }

  // Set notes from serialized state
  matrix.setNotes(structuredClone(serializedNotes));
  matrix.getNoteManager().rebuildIndex();

  // Restore selection if enabled
  if (preserveSelection && prevNoteHashes.size > 0) {
    const reselected = matrix.notes.filter(n =>
      prevNoteHashes.has(`${n.pitch}:${n.start}:${n.duration}:${n.velocity}`)
    );
    interactionStore.setSelectedNotes(reselected);
  }

  // Optional: re-schedule playback if engine is active
  const playbackEngine = PlaybackEngine.getInstance();
  if (playbackEngine?.isActive()) {
    const startAt = playbackEngine.getStartTime();
    const startBeat = playbackEngine.getStartBeat();
    void sequencer.reschedulePlayback(startAt, startBeat);
  }  

  matrix.requestRedraw();
}
