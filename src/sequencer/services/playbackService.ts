import { getTempo } from '@/shared/playback/transportService.js';
import { pitchToMidi } from '../../shared/utils/musical/noteUtils.js';
import { getAudioContext } from '../../sounds/audio/audio.js';
import { startInstrumentNote } from '../../sounds/utils/startInstrumentNote.js';
import type { Note } from '../../shared/interfaces/Note.js';
import type { Instrument } from '../../sounds/interfaces/Instrument.js';
import type { Grid } from '../matrix/Grid.js';

export interface ScheduledNoteHandle {
    sourceNode?: AudioBufferSourceNode;
    cancel?: () => void;
  }
  

export function stopScheduledNotes(
  instrument: Instrument | null,
  scheduledAnimations: number[]
): void {
  instrument?.stop?.();
  for (const timeoutId of scheduledAnimations) {
    clearTimeout(timeoutId);
  }
  scheduledAnimations.length = 0;
}

export async function preparePlayback(
  instrument: Instrument,
  initInstrument: () => Promise<void>,
  notes: Note[],
  collapsed: boolean,
  matrix: Grid | null,
  scheduledAnimations: number[],
  startAt: number,
  startBeat: number = 0
): Promise<void> {
  if (!matrix) return;

  if (!instrument) {
    await initInstrument();
  }

  stopScheduledNotes(instrument, scheduledAnimations);

  if (!instrument?.start) {
    console.warn('[playback] Instrument does not support scheduled playback.');
    return;
  }

  const bpm = getTempo();
  const beatDuration = 60 / bpm;
  const startWallTime = performance.now();

  notes.sort((a, b) => a.start - b.start);

  let i = 0;
  while (i < notes.length && notes[i].start < startBeat) i++;

  for (; i < notes.length; i++) {
    const note = notes[i];
    const midi = pitchToMidi(note.pitch);
    if (midi == null) continue;

    const offsetBeats = note.start - startBeat;
    const noteTime = startAt + offsetBeats * beatDuration;
    const duration = note.duration * beatDuration;
    const velocity = note.velocity ?? 100;

    startInstrumentNote({
        instrument,
        midi,
        time: noteTime,
        duration,
        velocity
      });
  
    if (!collapsed) {
        const wallTime = startWallTime + offsetBeats * beatDuration * 1000;
        const delay = Math.max(0, wallTime - performance.now());
        const timeoutId = setTimeout(() => {
            matrix?.playNoteAnimation(note);
        }, delay) as unknown as number;;
    
        scheduledAnimations.push(timeoutId);
    }
  }
}

export function resumeAnimationsFromCurrentTime(
  notes: Note[],
  startAt: number,
  startBeat: number,
  matrix: Grid | null,
  collapsed: boolean,
  scheduledAnimations: number[]
): void {
  if (!matrix || collapsed) return;

  const bpm = getTempo();
  const beatDuration = 60 / bpm;
  const nowWall = performance.now();
  const nowAudio = getAudioContext().currentTime;
  const elapsedAudio = nowAudio - startAt;
  const elapsedBeats = elapsedAudio / beatDuration;
  const currentBeat = startBeat + elapsedBeats;
  const startWallTime = nowWall - elapsedBeats * beatDuration * 1000;

  for (const note of notes) {
    if (note.start < currentBeat) continue;

    const offsetBeats = note.start - currentBeat;
    const delay = offsetBeats * beatDuration * 1000;

    if (delay >= 0) {
      const timeoutId = setTimeout(() => {
        matrix?.playNoteAnimation(note);
      }, delay) as unknown as number;;
      
      scheduledAnimations.push(timeoutId);
    }
  }
}

export async function reschedulePlayback(
  instrument: Instrument,
  initInstrument: () => Promise<void>,
  notes: Note[],
  matrix: Grid | null,
  collapsed: boolean,
  mute: boolean,
  shouldPlay: boolean,
  scheduledAnimations: number[],
  startAt: number,
  startBeat: number = 0
): Promise<void> {
  if (!matrix) return;

  stopScheduledNotes(instrument, scheduledAnimations);

  if (!instrument) {
    await initInstrument();
  }

  if (mute || !shouldPlay || !instrument?.start) return;

  const bpm = getTempo();
  const beatDuration = 60 / bpm;
  const startWallTime = performance.now();
  const nowAudio = getAudioContext().currentTime;

  const filtered = notes.filter(n => n.start >= startBeat);

  for (const note of filtered) {
    const midi = pitchToMidi(note.pitch);
    if (midi == null) continue;

    const offsetBeats = note.start - startBeat;
    const noteTime = startAt + offsetBeats * beatDuration;
    if (noteTime <= nowAudio + 0.01) continue;

    const duration = note.duration * beatDuration;
    const velocity = note.velocity ?? 100;

    startInstrumentNote({
        instrument,
        midi,
        time: noteTime,
        duration,
        velocity
      });

    if (!collapsed) {
        const wallTime = startWallTime + offsetBeats * beatDuration * 1000;
        const delay = Math.max(0, wallTime - performance.now());
        const timeoutId = setTimeout(() => {
            matrix?.playNoteAnimation(note);
        }, delay) as unknown as number;;
        
        scheduledAnimations.push(timeoutId);
    }
  }
}
