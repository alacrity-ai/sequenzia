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
  
// ✅ Also mock canvas.getContext to avoid initGrid crashes
if (typeof HTMLCanvasElement.prototype.getContext !== 'function') {
    HTMLCanvasElement.prototype.getContext = function getContextMock(type: string) {
      if (type === '2d') {
        const mock2DContext = {
          clearRect: () => {},
          fillRect: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fillText: () => {},
          translate: () => {},
          save: () => {},
          restore: () => {},
          setTransform: () => {},
          fill: () => {},
          strokeRect: () => {},
          drawImage: () => {},
        };
        return mock2DContext as unknown as CanvasRenderingContext2D;
      }
      return null;
    };
  }