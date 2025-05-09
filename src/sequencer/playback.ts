// // src/sequencer/playback.js

// import { getAudioContext } from '../sounds/audio/audio.js';
// import { isLoopEnabled, getTotalBeats } from './transport.js';
// import { resetPlayButtonState } from '../setup/footer/ui.js';
// import { getTempo } from './transport.js';
// import Sequencer from './sequencer.js';

// export class PlaybackEngine {
//     private context: AudioContext;
//     private sequencers: Sequencer[];
  
//     private startTime: number = 0; // AudioContext time
//     private startBeat: number = 0;
//     private isPlaying: boolean = false;

//     private animationFrameId: number | null = null;
  
//     constructor(sequencers: Sequencer[]) {
//       this.context = getAudioContext();
//       this.sequencers = sequencers;
//     }

//     private onResumeCallback: (() => void) | null = null;

//     setOnResumeCallback(cb: () => void): void {
//       this.onResumeCallback = cb;
//     }

//     private tick = () => {
//         if (!this.isPlaying) return;
//         const currentBeat = this.getCurrentBeat();
//         const endBeat = getTotalBeats();
    
//         if (currentBeat >= endBeat) {
//           if (isLoopEnabled()) {
//             this.seek(0);
//             this.start();
//           } else {
//             this.stop();
//             return;
//           }
//         }
    
//         this.animationFrameId = requestAnimationFrame(this.tick);
//     }

//     getCurrentBeat(): number {
//       if (!this.isPlaying) return this.startBeat;
//       const beatDuration = 60 / getTempo();
//       return ((this.context.currentTime - this.startTime) / beatDuration) + this.startBeat;
//     }
  
//     async start(): Promise<void> {
//         const scheduleAt = this.context.currentTime + 0.1;
    
//         this.startTime = scheduleAt;
//         this.startBeat = 0;
//         this.isPlaying = true;
    
//         await this.scheduleAll(scheduleAt, this.startBeat);
    
//         if (this.context.state === 'suspended') {
//           await this.context.resume();
//         }
    
//         this.animationFrameId = requestAnimationFrame(this.tick);
//     }

//     syncAfterTempoChange(oldBpm: number): void {
//         const now = this.context.currentTime;
//         const oldBeatDuration = 60 / oldBpm;
      
//         const currentBeat = ((now - this.startTime) / oldBeatDuration) + this.startBeat;
      
//         this.startBeat = currentBeat;
//         this.startTime = now;
//     }             

//     async pause(): Promise<void> {
//         if (!this.isPlaying) return;
//         const pauseBeat = this.getCurrentBeat();
    
//         for (const seq of this.sequencers) {
//           seq.stopScheduledNotes();
//         }
    
//         await this.context.suspend();
    
//         this.startBeat = pauseBeat;
//         this.isPlaying = false;
//         if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
//     }
  
//     async resume(): Promise<void> {
//         if (this.isPlaying) return;
    
//         await this.context.resume();
//         const actualTime = this.context.currentTime;
//         const scheduleAt = actualTime + 0.05;
//         this.startTime = scheduleAt;
    
//         await this.scheduleAll(scheduleAt, this.startBeat);
    
//         this.isPlaying = true;
//         this.onResumeCallback?.();
//         this.animationFrameId = requestAnimationFrame(this.tick);
//     } 

//     private async scheduleAll(startTime: number, startBeat: number): Promise<void> {
//         for (const seq of this.sequencers) {
//           if (seq.shouldPlay) {
//             await seq.preparePlayback(startTime, startBeat);
//           } else {
//             seq.stopScheduledNotes();
//           }
//         }
//     }      

//     stop(): void {
//         for (const seq of this.sequencers) {
//           seq.stopScheduledNotes();
//         }
//         this.isPlaying = false;
//         this.startBeat = 0;
//         this.startTime = 0;
//         if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
//         resetPlayButtonState();
//     }
  
//     seek(toBeat: number): void {
//         this.startBeat = toBeat;
//         this.startTime = this.context.currentTime;
//         this.isPlaying = false;
//         if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
//     }    

//     setSequencers(newSeqs: Sequencer[]): void {
//         this.sequencers = newSeqs;
//     }      

//     isActive(): boolean {
//       return this.isPlaying;
//     }

//     getStartTime(): number {
//       return this.startTime;
//     }
      
//     getStartBeat(): number {
//       return this.startBeat;
//     }
      
//   }
  