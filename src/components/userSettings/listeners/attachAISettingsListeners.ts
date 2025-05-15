// src/components/userSettings/listeners/attachAISettingsListeners.ts

import { getUserConfig, updateUserConfig } from '../store/userConfigStore.js';
import type { LLMModel } from '@/shared/llm/interfaces/LLMInterfaces';
import type { ListenerAttachment } from '../interfaces/ListenerAttachment.js';

export function attachAISettingsListeners(sectionEl: HTMLElement): ListenerAttachment {
  const keyInput = sectionEl.querySelector('#openai-key-input') as HTMLInputElement | null;
  const modelSelect = sectionEl.querySelector('#openai-model-select') as HTMLSelectElement | null;
  const aiIndicatorToggle = sectionEl.querySelector('#ai-track-indicator-toggle') as HTMLInputElement | null;

  const refreshUI = () => {
    const config = getUserConfig();
    if (keyInput) {
      keyInput.value = config.ai.openaiApiKey || '';
    }
    if (modelSelect) {
      modelSelect.value = config.ai.openaiModel || modelSelect.options[0]?.value || '';
    }
    if (aiIndicatorToggle) {
      aiIndicatorToggle.checked = !!config.ai.indicatorEnabled;
    }
  };

  const handleKeyInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    updateUserConfig({ ai: { openaiApiKey: input.value } });
  };

  const handleModelChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    updateUserConfig({ ai: { openaiModel: select.value as LLMModel } });
  };

  const handleIndicatorToggle = (e: Event) => {
    const input = e.target as HTMLInputElement;
    updateUserConfig({ ai: { indicatorEnabled: input.checked } });
  };

  keyInput?.addEventListener('input', handleKeyInput);
  modelSelect?.addEventListener('change', handleModelChange);
  aiIndicatorToggle?.addEventListener('change', handleIndicatorToggle);

  refreshUI(); // Sync immediately

  return {
    detach: () => {
      keyInput?.removeEventListener('input', handleKeyInput);
      modelSelect?.removeEventListener('change', handleModelChange);
      aiIndicatorToggle?.removeEventListener('change', handleIndicatorToggle);
    },
    refreshUI
  };
}
