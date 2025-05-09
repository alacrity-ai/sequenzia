import { h } from '../domUtils.js';

import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';


/**
 * Preset size definitions for modals.
 * 
 * These correspond to Tailwind-style sizing utilities and provide semantic shortcuts
 * for modal layout configuration.
 */
export const MODAL_SIZE_PRESETS: Record<string, { widthClass: string; maxWidthClass: string }> = {
  sm:   { widthClass: 'w-[300px]', maxWidthClass: 'max-w-sm' },
  md:   { widthClass: 'w-[500px]', maxWidthClass: 'max-w-md' },
  lg:   { widthClass: 'w-[700px]', maxWidthClass: 'max-w-lg' },
  xl:   { widthClass: 'w-[900px]', maxWidthClass: 'max-w-xl' },
  full: { widthClass: 'w-full',    maxWidthClass: 'max-w-full' }
};

type ModalSizeKey = keyof typeof MODAL_SIZE_PRESETS;

interface ModalOptions {
  /**
   * Optional explicit Tailwind width class (e.g. 'w-[600px]').
   * Overrides the preset if both are provided.
   */
  widthClass?: string;

  /**
   * Optional explicit Tailwind max-width class (e.g. 'max-w-2xl').
   * Overrides the preset if both are provided.
   */
  maxWidthClass?: string;

  /**
   * Optional semantic size preset — e.g., 'sm', 'md', 'lg', 'xl', 'full'.
   * Used when explicit width/maxWidth classes are not provided.
   */
  sizePreset?: ModalSizeKey;
}

/**
 * Creates a full-screen centered floating modal with a styled glowing halo, fade-in animation,
 * and gradient background. Designed for reuse across UI features (settings panels, warnings, etc.).
 * 
 * Content should be passed as an array of `HTMLElement`s or a single `HTMLElement` representing
 * the inner structure (e.g., tab bar, sections, footer).
 * 
 * Example usage:
 * ```ts
 * const modal = createFloatingModal('my-modal', [tabBar, content, footer], { sizePreset: 'lg' });
 * document.body.appendChild(modal);
 * ```
 * 
 * @param id - The DOM id to assign to the outer modal container.
 * @param content - A single HTMLElement or array of elements to insert into the modal body.
 * @param options - Optional configuration for width/maxWidth or a semantic size preset.
 * @returns The fully constructed modal HTMLElement, ready for DOM insertion.
 */
export function createFloatingModal(
  id: string,
  content: HTMLElement | HTMLElement[],
  options: ModalOptions = {}
): HTMLElement {
  const skin = getCurrentSkin();
  const preset = options.sizePreset ? MODAL_SIZE_PRESETS[options.sizePreset] : undefined;

  const widthClass = options.widthClass || preset?.widthClass || 'w-[500px]';
  const maxWidthClass = options.maxWidthClass || preset?.maxWidthClass || 'max-w-full';

  const haloGlow = h('div', {
    class: 'absolute inset-0 rounded-2xl border-2 border-purple-500 opacity-30 blur-xl animate-pulse pointer-events-none'
  });

  const modalInner = h('div', {
    class: [
      'relative flex flex-col',
      skin.menuBackground,
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
