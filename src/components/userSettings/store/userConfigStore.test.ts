// src/components/userSettings/store/userConfigStore.test.ts

// npm run test -- src/components/userSettings/store/userConfigStore.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserConfig,
  updateUserConfig,
  getLastSkin,
  updateLastSkin
} from './userConfigStore';

import * as sequencerStore from '@/components/sequencer/stores/sequencerStore';
import * as skins from '../skins/index';

import type Sequencer from '@/components/sequencer/sequencer';
import type { InterfaceSkin } from '../skins/interfaces/Skin.js';

describe('userConfigStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('updateUserConfig deeply merges config and triggers sequencer redraws', () => {
    const mockSequencer = { redraw: vi.fn() } as unknown as Sequencer;
    vi.spyOn(sequencerStore, 'getSequencers').mockReturnValue([mockSequencer]);

    updateUserConfig({ ai: { indicatorEnabled: false } });

    expect(getUserConfig().ai.indicatorEnabled).toBe(false);
    expect(mockSequencer.redraw).toHaveBeenCalled();
  });

  it('updateUserConfig does not crash if sequencer store is empty', () => {
    vi.spyOn(sequencerStore, 'getSequencers').mockReturnValue([]);

    updateUserConfig({ ai: { indicatorEnabled: true } });

    expect(getUserConfig().ai.indicatorEnabled).toBe(true);
  });

  it('updateUserConfig handles store not ready errors', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(sequencerStore, 'getSequencers').mockImplementation(() => {
      throw new Error('Store not ready');
    });

    updateUserConfig({ ai: { indicatorEnabled: false } });

    expect(warnSpy).toHaveBeenCalledWith(
      '[updateUserConfig] Skipped sequencer UI refresh (store not ready yet).',
      expect.any(Error)
    );
  });

  it('updateLastSkin updates and getLastSkin returns correct skin', () => {
    const mockSkin = { name: 'DarkTheme' } as unknown as InterfaceSkin;
    vi.spyOn(skins, 'getSkinByName').mockReturnValue(mockSkin);

    updateLastSkin('DarkTheme');
    expect(getLastSkin()).toBe(mockSkin);
  });
});
