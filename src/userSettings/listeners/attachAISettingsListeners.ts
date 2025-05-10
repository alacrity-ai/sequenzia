// src/userSettings/listeners/attachAISettingsListeners.ts
import { getUserConfig, updateUserConfig } from '../store/userConfigStore.js';
import type { OpenAIModel } from '../interfaces/OpenAISettings.js';
import type { ListenerAttachment } from '../interfaces/ListenerAttachment.js';

export function attachAISettingsListeners(sectionEl: HTMLElement): ListenerAttachment {
  const keyInput = sectionEl.querySelector('#openai-key-input') as HTMLInputElement | null;
  const modelSelect = sectionEl.querySelector('#openai-model-select') as HTMLSelectElement | null;

  const refreshUI = () => {
    const config = getUserConfig();
    if (keyInput) {
      keyInput.value = config.ai.openaiApiKey || '';
    }
    if (modelSelect) {
      modelSelect.value = config.ai.openaiModel || modelSelect.options[0]?.value || '';
    }
  };

  const handleKeyInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    updateUserConfig({ ai: { openaiApiKey: input.value } });
  };

  const handleModelChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    updateUserConfig({ ai: { openaiModel: select.value as OpenAIModel } });
  };

  keyInput?.addEventListener('input', handleKeyInput);
  modelSelect?.addEventListener('change', handleModelChange);

  refreshUI(); // 🧠 Sync with current store state immediately

  return {
    detach: () => {
      keyInput?.removeEventListener('input', handleKeyInput);
      modelSelect?.removeEventListener('change', handleModelChange);
    },
    refreshUI
  };
}
