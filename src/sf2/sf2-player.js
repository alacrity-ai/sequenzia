import { loadInstrument, getAudioContext } from './sf2-loader.js';
import { pitchToMidi } from '../audio/pitch-utils.js';


// 🔁 For virtual keyboard
let activeInstrument = null;
let activeName = null;

export async function setActiveInstrument(name) {
  if (activeName === name) return;

  const inst = await loadInstrument(name);
  activeInstrument = inst;
  activeName = name;

  console.log(`[SF2] Global keyboard instrument set to: ${name}`);
}

export function getActiveInstrumentName() {
  return activeName;
}

/**
 * Global keyboard note playback
 */
export function playSF2Note(pitch, velocity = 100, loop = false) {
    if (!activeInstrument) return null;
  
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const midi = pitchToMidi(pitch);
  
    // ⬇️ Check for special drum mapping
    const note = (activeInstrument.__midiMap?.get(midi)) ?? midi;
  
    activeInstrument.start({
      note,
      stopId: note,
      velocity,
      time: now,
      loop,
    });
  
    return () => {
      activeInstrument.stop({ stopId: note });
    };
  }
  

/**
 * Stop a global keyboard note
 */
export function stopNoteByPitch(pitch) {
    if (!activeInstrument) return;
  
    const midi = pitchToMidi(pitch);
    const stopId = activeInstrument.__midiMap?.get(midi) ?? midi;
  
    activeInstrument.stop({ stopId });
  }
  

/**
 * Per-sequencer playback using named instrument
 */
export async function loadAndPlayNote(
    instrumentName,
    pitch,
    durationSec,
    velocity = 100,
    loop = false,
    startTime = null,
    context = null,
    destination = null
  ) {
    const ctx = context || getAudioContext();
    const inst = await loadInstrument(instrumentName, ctx, destination);
    const midi = pitchToMidi(pitch);
    const note = (inst.__midiMap?.get(midi)) ?? midi;
  
    inst.start({
      note,
      duration: durationSec,
      velocity,
      loop,
      time: startTime ?? ctx.currentTime,
    });
  
    return null;
  }
  