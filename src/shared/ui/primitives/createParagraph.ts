// src/shared/ui/primitives/createParagraph.ts

import { h } from '../domUtils.js';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';

type ParagraphContent = string | HTMLElement;

/**
 * Creates a skinned paragraph element.
 * Supports inline elements like spans and links.
 */
export function createParagraph(...content: ParagraphContent[]): HTMLElement {
  const skin = getCurrentSkin();

  return h('p', {
    class: `text-sm leading-relaxed ${skin.textColor}`
  }, ...content);
}
