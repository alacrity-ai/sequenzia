import { h } from '@/shared/ui/domUtils.js';

/**
 * Creates the AI Working Modal UI.
 * 
 * Root element is #ai-working-modal.
 */
export function createAIWorkingModal(): HTMLElement {
  const haloGlow = h('div', {
    class: 'absolute inset-0 rounded-2xl border-2 border-purple-500 opacity-30 blur-xl animate-pulse pointer-events-none'
  });

  const robotEmoji = h('div', {
    class: 'text-[100px] mb-6 animate-bounce z-10',
    textContent: '🤖'
  });

  const loadingDots = h('div', {
    class: 'flex items-center space-x-3 mb-6 z-10'
  },
    h('div', {
      class: 'w-4 h-4 bg-purple-400 rounded-full animate-bounce',
      style: 'animation-delay: 0s'
    }),
    h('div', {
      class: 'w-4 h-4 bg-purple-400 rounded-full animate-bounce',
      style: 'animation-delay: 0.1s'
    }),
    h('div', {
      class: 'w-4 h-4 bg-purple-400 rounded-full animate-bounce',
      style: 'animation-delay: 0.2s'
    })
  );

  const subtext = h('div', {
    class: 'text-sm text-gray-400 mt-4 z-10 text-center',
    textContent: 'AI is Generating...'
  });

  const modalContent = h('div', {
    class: 'relative flex flex-col items-center bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-700 shadow-2xl rounded-2xl px-10 py-8 animate-fade-in w-[360px] max-w-full'
  }, haloGlow, robotEmoji, loadingDots, subtext);

  const modal = h('div', {
    id: 'ai-working-modal',
    class: 'fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] hidden'
  }, modalContent);

  return modal;
}
