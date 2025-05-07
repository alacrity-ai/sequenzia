// src/shared/ui/primitives/createFloatingModal.ts
import { h } from '../domUtils.js';

export const MODAL_SIZE_PRESETS: Record<string, { widthClass: string; maxWidthClass: string }> = {
  sm: { widthClass: 'w-[300px]', maxWidthClass: 'max-w-sm' },
  md: { widthClass: 'w-[500px]', maxWidthClass: 'max-w-md' },
  lg: { widthClass: 'w-[700px]', maxWidthClass: 'max-w-lg' },
  xl: { widthClass: 'w-[900px]', maxWidthClass: 'max-w-xl' },
  full: { widthClass: 'w-full', maxWidthClass: 'max-w-full' }
};

type ModalSizeKey = keyof typeof MODAL_SIZE_PRESETS;

interface ModalOptions {
  widthClass?: string;
  maxWidthClass?: string;
  sizePreset?: ModalSizeKey;
}

export function createFloatingModal(
  id: string,
  content: HTMLElement | HTMLElement[],
  options: ModalOptions = {}
): HTMLElement {
  const preset = options.sizePreset ? MODAL_SIZE_PRESETS[options.sizePreset] : undefined;

  const widthClass = options.widthClass || preset?.widthClass || 'w-[500px]';
  const maxWidthClass = options.maxWidthClass || preset?.maxWidthClass || 'max-w-full';

  const haloGlow = h('div', {
    class: 'absolute inset-0 rounded-2xl border-2 border-purple-500 opacity-30 blur-xl animate-pulse pointer-events-none'
  });

  const modalInner = h('div', {
    class: [
      'relative flex flex-col',
      'bg-gradient-to-br from-gray-800 to-gray-900',
      'border border-purple-700 shadow-2xl rounded-2xl',
      'px-10 py-8 animate-fade-in text-white',
      widthClass,
      maxWidthClass
    ].join(' ')
  },
    haloGlow,
    ...(Array.isArray(content) ? content : [content])
  );

  return h('div', {
    id,
    class: 'fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] hidden'
  }, modalInner);
}
