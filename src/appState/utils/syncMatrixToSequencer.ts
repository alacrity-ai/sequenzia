// src/appState/utils/syncLiveMatrixWithSerializedNotes.ts

import { engine as playbackEngine } from '../../main.js';

import type { Note } from '../../shared/interfaces/Note.js';
import type { Grid } from '../../sequencer/matrix/Grid.js';
import type { InteractionStore } from '../../sequencer/matrix/input/stores/InteractionStore.js';
import type Sequencer from '../../sequencer/sequencer.js';

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
  if (playbackEngine?.isActive()) {
    const startAt = playbackEngine.getStartTime();
    const startBeat = playbackEngine.getStartBeat();
    void sequencer.reschedulePlayback(startAt, startBeat);
  }  

  matrix.requestRedraw();
}
