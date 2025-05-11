// src/components/globalControls/modals/saveModal/wavOptionsModal.ts

import { h } from '@/shared/ui/domUtils.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { createParagraph } from '@/shared/ui/primitives/createParagraph.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createSelectInput } from '@/shared/ui/primitives/createSelectInput.js';
import { createFloatingModal } from '@/shared/ui/primitives/createFloatingModal.js';
import { createLabel } from '@/shared/ui/primitives/createLabel.js';
import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';
import { SaveLoadService } from '@/components/globalControls/services/SaveLoadService.js';


export class WavOptionsModal {
  private modalEl: HTMLElement;
  private sampleRateSelect: HTMLSelectElement;
  private includePanCheckbox: HTMLInputElement;
  private cancelButton: HTMLButtonElement;
  private applyButton: HTMLButtonElement;

  constructor() {
    const skin = getCurrentSkin();

    this.sampleRateSelect = createSelectInput({
      id: 'save-wav-sample-rate',
      options: [
        { value: '44100', label: '44,100 Hz (CD Quality)' },
        { value: '32000', label: '32,000 Hz' },
        { value: '22050', label: '22,050 Hz (Faster Export)' }
      ]
    }) as HTMLSelectElement;

    this.includePanCheckbox = h('input', {
      id: 'save-wav-include-pan',
      type: 'checkbox',
      checked: true,
      class: 'accent-purple-500'
    });

    this.cancelButton = createButton({
      id: 'save-wav-options-cancel-btn',
      text: 'Cancel',
      kind: 'secondary'
    });

    this.applyButton = createButton({
      id: 'save-wav-options-apply-btn',
      text: 'Export',
      kind: 'primary'
    });

    // Build modal inner content
    const content = [
      createHeader('Export Settings'),
      createParagraph('Choose your WAV export parameters.'),

      h('div', { class: 'z-10 mb-4 w-full' },
        createLabel({ text: 'Sample Rate', for: 'save-wav-sample-rate' }),
        this.sampleRateSelect
      ),

      h('div', { class: 'z-10 mb-6' },
        h('label', {
          class: `flex items-center gap-2 text-sm ${skin.textColor}`
        },
          this.includePanCheckbox,
          'Include Panning in Export'
        )
      ),

      h('div', { class: 'flex justify-end gap-4 z-10' },
        this.cancelButton,
        this.applyButton
      )
    ];

    this.modalEl = createFloatingModal('save-wav-options-modal', content, { sizePreset: 'md' });
    document.body.appendChild(this.modalEl);

    this.attachListeners();
  }

  private attachListeners(): void {
    this.cancelButton.addEventListener('click', () => this.hide());
    this.applyButton.addEventListener('click', () => {
      const sampleRate = parseInt(this.sampleRateSelect.value, 10);
      const includePan = this.includePanCheckbox.checked;
      this.hide();
      SaveLoadService.saveWavWithOptions({ sampleRate, includePan });
    });
  }

  public show(): void {
    this.modalEl.classList.remove('hidden');
  }

  public hide(): void {
    this.modalEl.classList.add('hidden');
  }

  public destroy(): void {
    this.modalEl.remove();
  }
}
