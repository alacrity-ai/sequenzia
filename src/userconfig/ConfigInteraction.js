import { getOpenAIKey, getOpenAIModel, setOpenAIKey, setOpenAIModel, saveToLocalStorage } from './userConfig.js';

export function initConfigModal() {
    const configModal = document.getElementById('userconfig-modal');
    const configSaveBtn = document.getElementById('config-save');
    const configCloseBtn = document.getElementById('config-close');
    const apiKeyInput = document.getElementById('openai-key-input');
    const modelSelect = document.getElementById('openai-model-select');

    // Initialize input values from current config
    apiKeyInput.value = getOpenAIKey();
    modelSelect.value = getOpenAIModel();

    configSaveBtn.addEventListener('click', () => {
        setOpenAIKey(apiKeyInput.value);
        setOpenAIModel(modelSelect.value);
        saveToLocalStorage();
        configModal.classList.add('hidden');
    });

    configCloseBtn.addEventListener('click', () => {
        // Reset form to current values
        apiKeyInput.value = getOpenAIKey();
        modelSelect.value = getOpenAIModel();
        configModal.classList.add('hidden');
    });

    document.getElementById('key-not-set-ok').addEventListener('click', () => {
        document.getElementById('openai-key-not-set-modal').classList.add('hidden');
    });
}