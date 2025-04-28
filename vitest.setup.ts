// vitest.setup.ts
import { vi } from 'vitest';

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
  
// Create a comprehensive mock of CanvasRenderingContext2D
const createCanvasContextMock = () => {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    translate: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
    fill: vi.fn(),
    strokeRect: vi.fn(),
    drawImage: vi.fn(),
    arc: vi.fn(),
    clip: vi.fn(),
    rect: vi.fn(),
    closePath: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 10 }),
    getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
    putImageData: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createPattern: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '10px sans-serif',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    lineCap: 'butt',
    lineJoin: 'miter',
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };
};

// Always override getContext to ensure we return our mock
HTMLCanvasElement.prototype.getContext = function getContextMock(contextType: any) {
  if (contextType === '2d') {
    return createCanvasContextMock() as unknown as CanvasRenderingContext2D;
  }
  return null;
} as any;

// Mock other canvas properties and methods
Object.defineProperties(HTMLCanvasElement.prototype, {
  width: {
    get: function() { return this._width || 300; },
    set: function(value) { this._width = value; }
  },
  height: {
    get: function() { return this._height || 150; },
    set: function(value) { this._height = value; }
  },
  style: {
    get: function() { 
      if (!this._style) {
        this._style = { 
          width: '300px', 
          height: '150px',
          cursor: 'default'
        };
      }
      return this._style;
    }
  }
});