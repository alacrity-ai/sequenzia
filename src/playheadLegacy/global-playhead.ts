// // src/playhead/global-playhead.ts

// import { PlaybackEngine } from '../sequencer/playback.js';

// let ctx: CanvasRenderingContext2D | null = null;
// let canvas: HTMLCanvasElement | null = null;
// let animationFrameId: number | null = null;
// let totalBeats: number = 1; // Default fallback to avoid divide-by-zero

// export function initGlobalPlayhead(canvasElement: HTMLCanvasElement): void {
//   canvas = canvasElement;
//   ctx = canvas.getContext('2d');
// }

// export function drawGlobalPlayhead(x: number): void {
//   if (!ctx || !canvas) return;

//   const { width, height } = canvas;
//   ctx.clearRect(0, 0, width, height);

//   const lineX = Math.round(x) + 0.5;

//   ctx.strokeStyle = '#ff00ff';
//   ctx.lineWidth = 1;
//   ctx.beginPath();
//   ctx.moveTo(lineX, 0);
//   ctx.lineTo(lineX, height);
//   ctx.stroke();
// }

// export function stopVisualPlayhead(): void {
//   if (animationFrameId !== null) {
//     cancelAnimationFrame(animationFrameId);
//     animationFrameId = null;
//   }
//   drawGlobalPlayhead(0);
// }

// export function pauseVisualPlayhead(): void {
//   if (animationFrameId !== null) {
//     cancelAnimationFrame(animationFrameId);
//     animationFrameId = null;
//   }
// }
