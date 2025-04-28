// src/setup/keyboardInstrumentState.ts

export function initKeyboardInstrumentState(): void {
    // Currently no setup needed, placeholder for future
}  

export function isKeyboardLoopEnabled(): boolean {
    const loopToggle = document.getElementById('instrument-loop-toggle') as HTMLInputElement | null;
    return loopToggle?.checked ?? false;
}
  