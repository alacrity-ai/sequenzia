import { audioCtx, masterGain } from '../audio/audio.js';
import { showLoadingModal, hideLoadingModal } from '../sequencer/ui.js';
import { Instrument } from './interfaces/Instrument.js';


// Smplr dynamic module placeholder
let smplr: any = null;
let activeInstrumentLoads = 0;

// Cache instruments *per context*
const contextInstrumentMap: Map<AudioContext, Map<string, Instrument>> = new Map();

// Utility to dynamically import smplr
export async function initSF2Engine(): Promise<void> {
  if (!smplr) {
    // @ts-ignore: dynamic remote import
    smplr = await import('https://unpkg.com/smplr@latest/dist/index.mjs');
  }
}

export function getAudioContext(): AudioContext {
  return audioCtx;
}

export async function loadInstrument(
  fullName: string,
  context: AudioContext = audioCtx,
  destination: AudioNode | null = null
): Promise<Instrument> {
  await initSF2Engine();

  const [libraryRaw, instrumentName] = fullName.includes('/')
    ? fullName.split('/')
    : ['musyngkite', fullName]; // Default to MusyngKite if unspecified

  const isOffline = context instanceof OfflineAudioContext;

  if (!contextInstrumentMap.has(context)) {
    contextInstrumentMap.set(context, new Map());
  }
  const instrumentMap = contextInstrumentMap.get(context)!;

  const cacheKey = `${libraryRaw}/${instrumentName}`;
  if (instrumentMap.has(cacheKey)) {
    return instrumentMap.get(cacheKey)!;
  }

  let instrument: Instrument;

  if (libraryRaw === 'smolken') {
    instrument = new smplr.Smolken(context, {
      instrument: instrumentName,
      destination: destination || masterGain,
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

  } else if (libraryRaw === 'splendidgrandpiano') {
    instrument = new smplr.SplendidGrandPiano(context, {
      destination: destination || masterGain,
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

  } else if (libraryRaw === 'electricpiano') {
    instrument = new smplr.ElectricPiano(context, {
      instrument: instrumentName,
      destination: destination || masterGain,
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

  } else if (libraryRaw === 'mallets') {
    instrument = new smplr.Mallet(context, {
      instrument: instrumentName,
      destination: destination || masterGain,
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

  } else if (libraryRaw === 'drummachines') {
    instrument = new smplr.DrumMachine(context, {
      instrument: instrumentName,
      destination: destination || masterGain,
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);

    // ⬇️ Generate MIDI-to-sample-name map
    const sampleNames: string[] = instrument.getSampleNames?.() ?? [];
    const midiMap = new Map<number, string>();
    sampleNames.forEach((name, i) => {
      const midi = 36 + i; // Map from C2 upward (MIDI 36 = C2)
      midiMap.set(midi, name);
    });

    instrument.__midiMap = midiMap;

  } else {
    // General soundfont instruments
    const kitMap: Record<string, string> = {
      'fluidr3-gm': 'FluidR3_GM',
      'fatboy': 'FatBoy',
      'musyngkite': 'MusyngKite'
    };

    const kit = kitMap[libraryRaw.toLowerCase()] || 'MusyngKite';
    const availableKits = await getAvailableSoundfontKits();
    console.log(`[Soundfont] Available kits: ${availableKits.join(', ')}`);
    console.log(`[Soundfont] Requested: kit=${kit} instrument=${instrumentName}`);

    const format = 'ogg';
    const url = `https://gleitz.github.io/midi-js-soundfonts/${kit}/${instrumentName}-${format}.js`;

    instrument = new smplr.Soundfont(context, {
      instrument: instrumentName,
      instrumentUrl: url,
      kit,
      destination: destination || masterGain,
      disableScheduler: isOffline,
    });
    await withLoading(instrument.load);
  }

  instrumentMap.set(cacheKey, instrument);
  return instrument;
}

// Instrument listing methods
export async function getMalletInstruments(): Promise<string[]> {
  await initSF2Engine();
  return smplr.getMalletNames();
}

export async function getElectricPianoInstruments(): Promise<string[]> {
  await initSF2Engine();
  return smplr.getElectricPianoNames();
}

export async function getSplendidGrandPianoInstruments(): Promise<string[]> {
  await initSF2Engine();
  return ['splendidgrandpiano'];
}

export async function getDrumMachineInstruments(): Promise<string[]> {
  await initSF2Engine();
  return smplr.getDrumMachineNames();
}

export async function getSmolkenInstruments(): Promise<string[]> {
  await initSF2Engine();
  return smplr.getSmolkenNames();
}

export async function getSoundfontInstruments(kit: string = 'MusyngKite'): Promise<string[]> {
  await initSF2Engine();
  const availableInstruments = await smplr.getSoundfontNames(kit);
  console.log(`[SF2] Instruments in kit "${kit}":`, availableInstruments);
  return availableInstruments;
}

export async function getAvailableSoundfontKits(): Promise<string[]> {
  await initSF2Engine();
  return smplr.getSoundfontKits();
}

// Loading feedback utilities
function onInstrumentLoadStart(): void {
  activeInstrumentLoads++;
  if (activeInstrumentLoads === 1) showLoadingModal();
}

function onInstrumentLoadEnd(): void {
  activeInstrumentLoads--;
  if (activeInstrumentLoads <= 0) {
    activeInstrumentLoads = 0;
    hideLoadingModal();
  }
}

async function withLoading(loadPromise: Promise<void>): Promise<void> {
  onInstrumentLoadStart();
  try {
    await loadPromise;
  } finally {
    onInstrumentLoadEnd();
  }
}
