// js/userconfig/settings/userConfig.js

const userConfig = {
    openaiApiKey: '',
    openaiModel: 'gpt-4o',
    gridColorScheme: 'Darkroom',
    noteColorScheme: 'Track Color'
  };
  
  export function getUserConfig() {
    return userConfig;
  }
  
  export function updateUserConfig(newConfig) {
    Object.assign(userConfig, newConfig);
  }
  