import { pitchToMidi } from '../../../helpers.js';

export function getNotesInMarquee(notes, {
    startX, currentX, startY, currentY,
    getCellHeight, getSnappedBeatFromX, getPitchFromRow
  }) {
    const x1 = Math.min(startX, currentX);
    const y1 = Math.min(startY, currentY);
    const x2 = Math.max(startX, currentX);
    const y2 = Math.max(startY, currentY);
  
    const topRow = Math.floor(y1 / getCellHeight());
    const bottomRow = Math.floor(y2 / getCellHeight());
    const startBeat = getSnappedBeatFromX(x1);
    const endBeat = getSnappedBeatFromX(x2);
  
    const pitchTop = pitchToMidi(getPitchFromRow(topRow));
    const pitchBottom = pitchToMidi(getPitchFromRow(bottomRow));
  
    return notes.filter(note => {
      const midi = pitchToMidi(note.pitch);
      const noteStart = note.start;
      const noteEnd = note.start + note.duration;
  
      const beatOverlap = noteEnd > startBeat && noteStart < endBeat;
      const pitchOverlap = midi >= pitchBottom - 1 && midi <= pitchTop + 1;
  
      return beatOverlap && pitchOverlap;
    });
  }
  