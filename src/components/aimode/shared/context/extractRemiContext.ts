// src/components/aimode/shared/context/extractRemiContext.ts

import type Sequencer from "@/components/sequencer/sequencer";
import type { RemiEvent } from '@/shared/interfaces/RemiEvent.js';
import type { Note } from '@/shared/interfaces/Note.js';
import type { RemiEncodeOptions } from '@/shared/interfaces/RemiEncoderOptions.js';
import type { ExtractedRemiContext } from '@/components/aimode/interfaces/ExtractedRemiContext';

import { devLog } from '@/shared/state/devMode';
import { remiEncode } from '@/shared/utils/musical/remi/remiUtils.js';

export function extractRemiContext(
  activeSequencerId: number,
  sequencers: Sequencer[],
  startBeat: number,
  endBeat: number,
  remiSettings?: RemiEncodeOptions
): ExtractedRemiContext {
  const isNoteInRange = (note: Note) =>
    note.start >= startBeat && note.start < endBeat;

  const primarySequencer = sequencers.find(seq => seq.id === activeSequencerId);

  if (!primarySequencer) {
    throw new Error(`Sequencer with id ${activeSequencerId} not found.`);
  }

  const primaryNotes = primarySequencer.notes.filter(isNoteInRange);
  const primaryTrackRemi = remiEncode(primaryNotes, remiSettings);

  const otherTracksRemi: RemiEvent[][] = sequencers
    .filter(seq => seq.id !== activeSequencerId)
    .map(seq => {
      const notesInRange = seq.notes.filter(isNoteInRange);
      return remiEncode(notesInRange, remiSettings);
    });

  devLog('[AutoComplete] Extracted Context:', {
    primaryTrackRemi,
    otherTracksRemi,
    startBeat,
    endBeat
  });

  return {
    primaryTrackRemi,
    otherTracksRemi,
    startBeat,
    endBeat
  };
}