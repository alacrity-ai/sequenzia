// src/sounds/helpers/getInstruments.ts

import { enginePlayers } from '@/sounds/instrument-player.js';
import { engineLoaders } from '@/sounds/instrument-loader.js';
import { EngineName } from '@/sounds/interfaces/Engine.js';
import { DEFAULT_ENGINE } from '@/sounds/instrument-loader.js';
import { getKeyboardInstrument } from '@/components/topControls/components/keyboard/services/keyboardService.js';

import type Sequencer from '@/components/sequencer/sequencer.js';


// Gets all available soundfont engines
export function getAvailableEngines(): EngineName[] {
  return Object.keys(enginePlayers) as EngineName[];
}

export async function getAvailableLibraries(engineName: EngineName = DEFAULT_ENGINE): Promise<string[]> {
  const engine = engineLoaders[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);
  const libraries = await engine.getAvailableLibraries();
  return libraries;
}

export async function getAvailableInstruments(
  libraryName: string,
  engineName: EngineName = DEFAULT_ENGINE
): Promise<string[]> {
  const engine = engineLoaders[engineName];
  if (!engine) throw new Error(`Engine "${engineName}" not available`);

  return await engine.getAvailableInstruments(libraryName);
}

// Used to get global virtual piano's current instrument
export function getGlobalActiveInstrumentName(): string | null {
  return getKeyboardInstrument();
}

// Used to get the current sequencer's instrument
export function getSequencerActiveInstrumentName(sequencer: Sequencer): string {
  return sequencer.instrumentName;
}
