// vitest.setup.ts

if (typeof globalThis.AudioContext === 'undefined') {
    (globalThis as any).AudioContext = class {
      createGain() {
        return { connect: () => {} };
      }
      createOscillator() {
        return { connect: () => {}, start: () => {}, stop: () => {} };
      }
      createAnalyser() {
        return {
          fftSize: 2048,
          getByteTimeDomainData: (array: Uint8Array) => {},
          getByteFrequencyData: (array: Uint8Array) => {},
          connect: () => {},
        };
      }
      destination = {};
      resume = async () => {};
      suspend = async () => {};
    };
  }
  