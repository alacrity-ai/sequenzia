import { OpenAIModel } from '../interfaces/OpenAISettings.js';
import { getUserConfig, updateUserConfig } from '../store/userConfigStore.js';
import { saveToLocalStorage } from '../utils/localStorage.js';

export const VALID_MODELS: OpenAIModel[] = [
  'gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3-mini', 'o4-mini'
];

/**
 * Retrieves the OpenAI API key from user config.
 */
export function getOpenAIKey(): string {
  return getUserConfig().ai.openaiApiKey;
}

/**
 * Retrieves the selected OpenAI model from user config.
 */
export function getOpenAIModel(): OpenAIModel {
  return getUserConfig().ai.openaiModel as OpenAIModel;
}

/**
 * Updates the OpenAI API key.
 */
export function setOpenAIKey(key: string): void {
  updateUserConfig({ai: { openaiApiKey: key }});
}

/**
 * Updates the selected OpenAI model.
 * Throws error if invalid model.
 */
export function setOpenAIModel(model: OpenAIModel): void {
  if (!VALID_MODELS.includes(model)) {
    throw new Error(`Invalid model: ${model}. Must be one of: ${VALID_MODELS.join(', ')}`);
  }
  updateUserConfig({ai: { openaiModel: model }});
}

/**
 * Initializes the AI Settings UI elements and event listeners.
 */
export function initAISettingsUI(): void {
  const apiKeyInput = document.getElementById('openai-key-input') as HTMLInputElement;
  const modelSelect = document.getElementById('openai-model-select') as HTMLSelectElement;
  const saveBtn = document.getElementById('config-save') as HTMLButtonElement;
  const closeBtns = document.querySelectorAll('#config-close, #config-close-bottom') as NodeListOf<HTMLButtonElement>;

  // Load initial values
  apiKeyInput.value = getOpenAIKey();
  modelSelect.value = getOpenAIModel();

  // Save config
  saveBtn.addEventListener('click', () => {
    setOpenAIKey(apiKeyInput.value);
    setOpenAIModel(modelSelect.value as OpenAIModel);
    saveToLocalStorage();
    document.getElementById('userconfig-modal')?.classList.add('hidden');
  });

  // Close/reset behavior
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      apiKeyInput.value = getOpenAIKey();
      modelSelect.value = getOpenAIModel();
      document.getElementById('userconfig-modal')?.classList.add('hidden');
    });
  });

  // Error modal close
  document.getElementById('key-not-set-ok')?.addEventListener('click', () => {
    document.getElementById('openai-key-not-set-modal')?.classList.add('hidden');
  });
}
