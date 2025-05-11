// src/components/topControls/components/keyboard/stores/keyboardStore.ts

import type { KeyMap } from '../helpers/keys.js';
import { getKeyMap } from '../helpers/keys.js';
import { setGlobalActiveInstrument } from '@/sounds/instrument-player.js';

let globalKeyboardInstrument: string = 'sf2/fluidr3-gm/acoustic_grand_piano';
let currentOctave = 3;
let keyboardInputEnabled = false;
let keyMap: KeyMap = getKeyMap(currentOctave);

export function initKeyboardInstrumentState(): void {
    // Reset to default on app start
    globalKeyboardInstrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
    setGlobalActiveInstrument(globalKeyboardInstrument);
}

export function setKeyboardInstrument(fullName: string): void {
    setGlobalActiveInstrument(fullName);
    globalKeyboardInstrument = fullName;
}

export function getKeyboardInstrument(): string {
    return globalKeyboardInstrument;
}

export function isKeyboardLoopEnabled(): boolean {
    const loopToggle = document.getElementById('instrument-loop-toggle') as HTMLInputElement | null;
    return loopToggle?.checked ?? false;
}

export function getCurrentOctave(): number {
    return currentOctave;
}

export function setCurrentOctave(octave: number): void {
    currentOctave = octave;
}

export function isKeyboardInputEnabled(): boolean {
    return keyboardInputEnabled;
}

export function setKeyboardInputEnabled(enabled: boolean): void {
    keyboardInputEnabled = enabled;
}

export function getKeyMapRef(): KeyMap {
    return keyMap;
}

export function setKeyMapRef(map: KeyMap): void {
    keyMap = map;
}
