// src/sounds/audio/previewContext.ts

let previewContext: AudioContext | null = null;
let previewDestination: GainNode | null = null;

export function getPreviewContext(): AudioContext {
  if (!previewContext) {
    previewContext = new AudioContext();
  }
  return previewContext;
}

export function getPreviewDestination(): AudioNode {
  if (!previewDestination) {
    const ctx = getPreviewContext();
    previewDestination = ctx.createGain();
    previewDestination.connect(ctx.destination);
  }
  return previewDestination;
}
