// src/setup/keyboardInstrumentState.ts

let globalKeyboardInstrument: string = 'sf2/fluidr3-gm/acoustic_grand_piano';

export function initKeyboardInstrumentState(): void {
    // Reset to default on app start
    globalKeyboardInstrument = 'sf2/fluidr3-gm/acoustic_grand_piano';
}

export function setKeyboardInstrument(fullName: string): void {
    globalKeyboardInstrument = fullName;
}

export function getKeyboardInstrument(): string {
    return globalKeyboardInstrument;
}

export function isKeyboardLoopEnabled(): boolean {
    const loopToggle = document.getElementById('instrument-loop-toggle') as HTMLInputElement | null;
    return loopToggle?.checked ?? false;
}
