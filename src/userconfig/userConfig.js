// Default OpenAI configuration
const userConfig = {
    openaiApiKey: '',  // Empty by default - will be set via config modal
    openaiModel: 'gpt-4o',  // Default model
};

// Getter functions
export function getOpenAIKey() {
    return userConfig.openaiApiKey;
}

export function getOpenAIModel() {
    return userConfig.openaiModel;
}

// Setter functions
export function setOpenAIKey(key) {
    userConfig.openaiApiKey = key;
}

export function setOpenAIModel(model) {
    const validModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3-mini', 'o4-mini'];
    if (!validModels.includes(model)) {
        throw new Error(`Invalid model: ${model}. Must be one of: ${validModels.join(', ')}`);
    }
    userConfig.openaiModel = model;
}

// Optional: Load/Save to localStorage
export function saveToLocalStorage() {
    localStorage.setItem('userConfig', JSON.stringify(userConfig));
}

export function loadFromLocalStorage() {
    const stored = localStorage.getItem('userConfig');
    if (stored) {
        const parsed = JSON.parse(stored);
        userConfig.openaiApiKey = parsed.openaiApiKey || '';
        userConfig.openaiModel = parsed.openaiModel || 'gpt-4o';
    }
}

// Initialize from localStorage if available
loadFromLocalStorage();
