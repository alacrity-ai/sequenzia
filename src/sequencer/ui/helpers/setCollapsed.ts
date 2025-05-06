import type Sequencer from '../../sequencer.js';

import { engine as playbackEngine } from '../../../main.js';

export function setCollapsed(seq: Sequencer, val: boolean): void {
    seq.collapsed = val;
  
    if (val) {
      // Prevent animation rendering
      seq.animCanvas?.classList.add('hidden');
  
      // Cancel pending animation timeouts
      for (const timeoutId of seq.scheduledAnimations) {
        clearTimeout(timeoutId);
      }
      seq.scheduledAnimations = [];
  
    } else {
      seq.animCanvas?.classList.remove('hidden');
  
      // Call resize to redraw the grid
      seq.matrix?.resize();

      // If we are playing, re-schedule animations from the current time
      if (playbackEngine.isActive()) {
          seq.resumeAnimationsFromCurrentTime(
          playbackEngine.getStartTime(),
          playbackEngine.getStartBeat()
        );
      }
    }
  }