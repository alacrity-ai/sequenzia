import type Sequencer from '../../sequencer.js';

import { toggleZoomControls } from '../../ui/controls/zoomControls.js';
import { toggleSequencerGripHandle } from '../../ui/controls/gripHandler.js';
import { engine as playbackEngine } from '../../../main.js';
import { drawMiniContour } from '../../ui/renderers/drawMiniContour.js';

export function setCollapsed(seq: Sequencer, val: boolean = true): void {
    if (!seq.container || !seq.body || !seq.miniContour || !seq.collapseIcon) return;
    seq.collapsed = val;

    const container = seq.container as HTMLElement;
    const body = seq.body;
    const mini = seq.miniContour;
    const icon = seq.collapseIcon;
  
    const toggleUIVisibility = (visible: boolean): void => {
      toggleZoomControls(container, visible);
      toggleSequencerGripHandle(container, visible);
    };
  
    const cancelScheduledAnimations = (): void => {
      for (const id of seq.scheduledAnimations) clearTimeout(id);
      seq.scheduledAnimations = [];
    };
  
    body.classList.toggle('hidden', val);
    mini.classList.toggle('hidden', !val);
    icon.setAttribute('href', val ? '#icon-caret-up' : '#icon-caret-down');
  
    if (val) {
      cancelScheduledAnimations();
      toggleUIVisibility(false);
      drawMiniContour(mini, seq.notes, seq.config, seq.colorIndex);
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
  