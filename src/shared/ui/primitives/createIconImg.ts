import { h } from '@/shared/ui/domUtils.js';
import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';

export function icon(name: string, alt: string): HTMLElement {
  return h('img', {
    src: getAssetPath(`static/svg/${name}.svg`),
    class: 'w-6 h-6',
    alt
  });
}
