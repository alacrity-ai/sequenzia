// src/shared/dev/devTools.js

import { getSequencers as getSeqs } from '@/components/sequencer/factories/SequencerFactory.js';
import { devLog } from '@/shared/state/devMode.js';

export function getSequencers() {
  return getSeqs();
}

export function dumpSequencers(): void {
  devLog('Sequencer Dump', getSequencers());
}
