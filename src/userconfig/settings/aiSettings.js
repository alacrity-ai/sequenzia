// js/userconfig/settings/aiSettings.js

import { getUserConfig, updateUserConfig } from './userConfig.js';
import { saveToLocalStorage } from './sharedSettings.js';

export const VALID_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3-mini', 'o4-mini'];

// Getter functions
export function getOpenAIKey() {
  return getUserConfig().openaiApiKey;
}

export function getOpenAIModel() {
  return getUserConfig().openaiModel;
}

// Setter functions
export function setOpenAIKey(key) {
  updateUserConfig({ openaiApiKey: key });
}

export function setOpenAIModel(model) {
  if (!VALID_MODELS.includes(model)) {
    throw new Error(`Invalid model: ${model}. Must be one of: ${VALID_MODELS.join(', ')}`);
  }
  updateUserConfig({ openaiModel: model });
}

// ✅ Setup function to initialize event listeners for this section
export function initAISettingsUI() {
  const apiKeyInput = document.getElementById('openai-key-input');
  const modelSelect = document.getElementById('openai-model-select');
  const saveBtn = document.getElementById('config-save');
  const closeBtns = document.querySelectorAll('#config-close, #config-close-bottom');

  // Load initial values
  apiKeyInput.value = getOpenAIKey();
  modelSelect.value = getOpenAIModel();

  // Save config
  saveBtn.addEventListener('click', () => {
    setOpenAIKey(apiKeyInput.value);
    setOpenAIModel(modelSelect.value);
    saveToLocalStorage();
    document.getElementById('userconfig-modal').classList.add('hidden');
  });

  // Close/reset behavior
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      apiKeyInput.value = getOpenAIKey();
      modelSelect.value = getOpenAIModel();
      document.getElementById('userconfig-modal').classList.add('hidden');
    });
  });

  // Error modal close
  document.getElementById('key-not-set-ok')?.addEventListener('click', () => {
    document.getElementById('openai-key-not-set-modal')?.classList.add('hidden');
  });
}
