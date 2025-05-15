// src/components/userSettings/utils/localStorage.test.ts

// npm run test -- src/components/userSettings/utils/localStorage.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  resetUserConfigToDefaults,
  saveUserConfigToLocalStorage,
  loadUserConfigFromLocalStorage
} from './localStorage';

import * as userConfigStore from '@/components/userSettings/store/userConfigStore';
import * as storageUtils from '@/shared/utils/storage/localStorage';
import { defaultUserConfig } from '@/components/userSettings/store/defaultUserSettings';

import type { UserConfig } from '@/components/userSettings/interfaces/UserConfig';

describe('userSettings/localStorage utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('resetUserConfigToDefaults updates config and saves to localStorage', () => {
    const updateUserConfigSpy = vi.spyOn(userConfigStore, 'updateUserConfig');
    const saveUserConfigSpy = vi.spyOn(storageUtils, 'saveJSON').mockImplementation(() => {});

    resetUserConfigToDefaults();

    expect(updateUserConfigSpy).toHaveBeenCalledWith(structuredClone(defaultUserConfig));
    expect(saveUserConfigSpy).toHaveBeenCalledWith('userConfig', expect.any(Object));
  });

  it('saveUserConfigToLocalStorage saves current config', () => {
    const mockConfig = {
      global: { noteToolMode: 'default' },
      ai: {
        openaiApiKey: 'test-key',
        openaiModel: 'gpt-4o',
        indicatorEnabled: true,
      },
      theme: {
        gridColorScheme: 'dark',
        noteColorScheme: 'classic',
        skin: 'DarkSkin',
      },
    } satisfies UserConfig;

    vi.spyOn(userConfigStore, 'getUserConfig').mockReturnValue(mockConfig);
    const saveJSONSpy = vi.spyOn(storageUtils, 'saveJSON').mockImplementation(() => {});

    saveUserConfigToLocalStorage();

    expect(saveJSONSpy).toHaveBeenCalledWith('userConfig', mockConfig);
  });

  it('loadUserConfigFromLocalStorage loads config and updates if present', () => {
    const loadedConfig = { ai: { indicatorEnabled: false } };
    vi.spyOn(storageUtils, 'loadJSON').mockReturnValue(loadedConfig);
    const updateUserConfigSpy = vi.spyOn(userConfigStore, 'updateUserConfig');

    loadUserConfigFromLocalStorage();

    expect(updateUserConfigSpy).toHaveBeenCalledWith(loadedConfig);
  });

  it('loadUserConfigFromLocalStorage does not update if load returns null', () => {
    vi.spyOn(storageUtils, 'loadJSON').mockReturnValue(null);
    const updateUserConfigSpy = vi.spyOn(userConfigStore, 'updateUserConfig');

    loadUserConfigFromLocalStorage();

    expect(updateUserConfigSpy).not.toHaveBeenCalled();
  });
});
