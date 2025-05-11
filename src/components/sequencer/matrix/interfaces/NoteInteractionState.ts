// src/components/sequencer/matrix/interfaces/NoteInteractionState.ts

export interface NoteInteractionState {
    hovered: boolean; // If we're simply hovering over a note, e.g. in DefaultNoteToolHandler
    highlighted: boolean; // If we're highlighting a note, e.g. if it's currently within an active Marquee
    selected: boolean; // If we've actively selected a note, e.g. after mouseup on a marquee, or just clicking on it in DefaultNoteToolHandler
}
  