import { getAppState as getAppSt } from '@/appState/appState.js';
import { devLog } from '@/shared/state/devMode.js';

export function getAppState() {
  return getAppSt();
}

export function dumpState(): void {
  devLog('App State Dump', getAppState());
}
