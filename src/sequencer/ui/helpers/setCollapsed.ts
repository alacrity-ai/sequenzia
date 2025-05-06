import type Sequencer from '../../sequencer.js';

import { toggleZoomControls } from '../../ui/controls/zoomControls.js';
import { toggleSequencerGripHandle } from '../../ui/controls/gripHandler.js';
import { engine as playbackEngine } from '../../../main.js';

export function setCollapsed(seq: Sequencer, val: boolean): void {
    seq.collapsed = val;
  
    const container = seq.container as HTMLElement;
  
    const toggleUIVisibility = (visible: boolean): void => {
      toggleZoomControls(container, visible);
      toggleSequencerGripHandle(container, visible);
    };
  
    const cancelScheduledAnimations = (): void => {
      for (const id of seq.scheduledAnimations) clearTimeout(id);
      seq.scheduledAnimations = [];
    };
  
    if (val) {
      cancelScheduledAnimations();
      toggleUIVisibility(false);
    } else {
      toggleUIVisibility(true);
      seq.matrix?.resize();
  
      if (playbackEngine.isActive()) {
        seq.resumeAnimationsFromCurrentTime(
          playbackEngine.getStartTime(),
          playbackEngine.getStartBeat()
        );
      }
    }
  }
  