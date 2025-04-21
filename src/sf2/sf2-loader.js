import { audioCtx, masterGain } from '../audio/audio.js';
import { showLoadingModal, hideLoadingModal } from '../sequencer/ui.js';
let smplr = null;
let activeInstrumentLoads = 0;

// Cache instruments *per context*
const contextInstrumentMap = new Map();

export async function initSF2Engine() {
  if (!smplr) {
    smplr = await import('https://unpkg.com/smplr@latest/dist/index.mjs');
  }
}

export function getAudioContext() {
  return audioCtx;
}

export async function loadInstrument(fullName, context = audioCtx, destination = null) {
    await initSF2Engine();
  
    const [libraryRaw, instrumentName] = fullName.includes('/')
      ? fullName.split('/')
      : ['musyngkite', fullName]; // Default to MusyngKite if unspecified
  
    const isOffline = context instanceof OfflineAudioContext;
  
    if (!contextInstrumentMap.has(context)) {
      contextInstrumentMap.set(context, new Map());
    }
    const instrumentMap = contextInstrumentMap.get(context);
  
    const cacheKey = `${libraryRaw}/${instrumentName}`;
    if (instrumentMap.has(cacheKey)) {
      return instrumentMap.get(cacheKey);
    }
  
    let instrument;
  
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
        const sampleNames = instrument.getSampleNames();
        const midiMap = new Map();
        sampleNames.forEach((name, i) => {
          const midi = 36 + i; // Map from C2 upward (MIDI 36 = C2)
          midiMap.set(midi, name);
        });
      
        instrument.__midiMap = midiMap; // ⬅️ Store mapping on instance
      
      } else {
        // Map library names to kit names
        const kitMap = {
          'fluidr3-gm': 'FluidR3_GM',
          'fatboy': 'FatBoy',
          'musyngkite': 'MusyngKite'
        };
        
        const kit = kitMap[libraryRaw.toLowerCase()] || 'MusyngKite';
        // Get all available soundfont kits
        const availableKits = await getAvailableSoundfontKits();
        console.log(`[Soundfont] Available kits: ${availableKits.join(', ')}`);
        console.log(`[Soundfont] Requested: kit=${kit} instrument=${instrumentName}`);

        const format = "ogg";
        const url = `https://gleitz.github.io/midi-js-soundfonts/${kit}/${instrumentName}-${format}.js`;
        
        instrument = new smplr.Soundfont(context, {
          instrument: instrumentName, // optional, for naming only
          instrumentUrl: url,         // ✅ this is what actually drives kit selection
          kit,                        // optional, for internal labeling
          destination: destination || masterGain,
          disableScheduler: isOffline,
        });
        await withLoading(instrument.load);
    }
      
  
    instrumentMap.set(cacheKey, instrument);
    return instrument;
  }

export async function getMalletInstruments() {
  await initSF2Engine();
  return smplr.getMalletNames();
}
  
export async function getDrumMachineInstruments() {
  await initSF2Engine();
  return smplr.getDrumMachineNames(); // e.g. ['TR-808', 'TR-909']
}

export async function getSmolkenInstruments() {
  await initSF2Engine();
  return smplr.getSmolkenNames();
}

export async function getSoundfontInstruments(kit = 'MusyngKite') {
    await initSF2Engine();
    const availableInstruments = await smplr.getSoundfontNames(kit);
    console.log(`[SF2] Instruments in kit "${kit}":`, availableInstruments);
    return availableInstruments;
  }
  
  
export async function getAvailableSoundfontKits() {
    await initSF2Engine();
    return smplr.getSoundfontKits(); // ['MusyngKite', 'FluidR3_GM']
  }

function onInstrumentLoadStart() {
    activeInstrumentLoads++;
    if (activeInstrumentLoads === 1) showLoadingModal(); // only show on first load
}

function onInstrumentLoadEnd() {
    activeInstrumentLoads--;
    if (activeInstrumentLoads <= 0) {
      activeInstrumentLoads = 0;
      hideLoadingModal(); // only hide when all have finished
    }
}

async function withLoading(loadPromise) {
    onInstrumentLoadStart();
    try {
      await loadPromise;
    } finally {
      onInstrumentLoadEnd();
    }
  }
  