// src/shared/ui/primitives/createAccentSpan.ts
import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';

export function createAccentSpan(text: string): HTMLElement {
  const skin = getCurrentSkin();
  return h('span', {
    class: `font-semibold ${skin.accentColor} rounded text-xs`,
    textContent: text
  });
}
