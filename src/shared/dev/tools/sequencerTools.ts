// src/shared/dev/devTools.js

import { getSequencers as getSeqs } from '../../../sequencer/factories/SequencerFactory.js';
import { devLog } from '../../state/devMode.js';

export function getSequencers() {
  return getSeqs();
}

export function dumpSequencers(): void {
  devLog('Sequencer Dump', getSequencers());
}
