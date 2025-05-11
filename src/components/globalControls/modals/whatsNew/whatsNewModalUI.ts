// src/components/globalControls/modals/whatsNew/whatsNewModalUI.ts

import { h } from '@/shared/ui/domUtils.js';
import { getAssetPath } from '@/shared/utils/storage/assetHelpers.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createLabel } from '@/shared/ui/primitives/createLabel.js';
import {
  WHATS_NEW_VERSION,
  WHATS_NEW_DATE,
  WHATS_NEW_CONTENT
} from '@/shared/constants/WHATS_NEW.js';

export function createWhatsNewModal(): HTMLElement {
  const metadata = createLabel({
    text: `${WHATS_NEW_VERSION} — Updated ${WHATS_NEW_DATE}`
  });
  metadata.id = 'whats-new-metadata';
  metadata.classList.add('italic', 'text-gray-400', 'text-center', 'self-center', 'mb-4');

  const contentContainer = h('ul', {
    id: 'whats-new-content',
    class: 'list-disc list-inside text-left space-y-2 text-md w-full'
  });

  // Render grouped content
  let currentSectionUl: HTMLUListElement | null = null;

  for (const item of WHATS_NEW_CONTENT) {
    if (item.startsWith("✨") || item.startsWith("🐞") || item.startsWith("🛣️")) {
      const sectionTitle = h('li', {
        class: 'font-bold mt-6 text-lg',
        textContent: item
      });

      contentContainer.appendChild(sectionTitle);

      currentSectionUl = h('ul', {
        class: 'list-disc list-inside ml-6 mt-2 space-y-1'
      });
      contentContainer.appendChild(currentSectionUl);
    } else if (currentSectionUl) {
      const li = h('li', { textContent: item.replace(/^- /, '') });
      currentSectionUl.appendChild(li);
    }
  }

  const logo = h('img', {
    src: getAssetPath('static/logo.png'),
    alt: 'Sequenzia',
    class: 'w-[180px] h-auto rounded-xl mb-6 self-center'
  });

  const closeButton = createButton({
    id: 'whats-new-close-btn',
    text: 'Close',
    kind: 'primary',
    additionalClasses: 'mt-8 self-center text-base px-6 py-2 font-medium'
  });

  const header = createHeader({
    text: '🆕 What\'s New in Sequenzia',
    size: 'xl',
    additionalClasses: 'text-center self-center'
  });

  return createFloatingModal('whats-new-modal', [
    logo,
    header,
    metadata,
    contentContainer,
    closeButton
  ], { sizePreset: 'xl' });
}