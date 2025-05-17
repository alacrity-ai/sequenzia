// src/shared/ui/primitives/createTabBar.ts
import { h } from '../domUtils.js';

import { getCurrentSkin } from '@/components/userSettings/store/userConfigStore.js';

/*
Creates a navigation bar, with clickable icons
e.g.:
[icon] [icon] [icon]
*/
export interface TabDefinition {
  key: string;               // e.g., "global-settings"
  icon: string;              // e.g., "⚙️"
  title: string;             // tooltip/title
  isActive?: boolean;        // whether this is the default active tab
}

/**
 * Creates a stylized tab bar consisting of horizontally spaced emoji-style icon tabs.
 * Each tab is implemented as a `<span>` with hover transitions, and tagged with a
 * `data-tab` attribute corresponding to a keyed section container (e.g., 'global-settings').
 * 
 * This function only returns the visual tab bar — switching logic is expected to be handled
 * separately by `attachModalListeners()` or similar.
 * 
 * Example usage:
 * ```ts
 * const tabBar = createTabBar([
 *   { key: 'global-settings', icon: '⚙️', title: 'Global Settings' },
 *   { key: 'theme-settings',  icon: '🎹', title: 'Theme Settings' },
 *   { key: 'ai-settings',     icon: '🤖', title: 'AI Settings', isActive: true }
 * ]);
 * ```
 * 
 * @param tabs - An array of tab definitions to display in the bar.
 * @returns An HTMLElement representing the full tab bar row.
 */
export function createTabBar(tabs: TabDefinition[]): HTMLElement {
  const skin = getCurrentSkin();
  const menuBackground = skin.menuBackground;
  const borderColor = skin.borderColor;

  return h('div', {
    class: [
      'sticky top-0',
      'flex justify-between items-center',
      'mb-6 border-b',
      menuBackground,
      borderColor,
      'z-999',
      'pb-2 pt-3 px-4'
    ].join(' ')
  },
    h('div', { class: 'flex gap-4 text-xl select-none' },
      ...tabs.map(tab =>
        h('span', {
          class: [
            'settings-tab',
            'hover:text-white hover:scale-110 transition-all duration-150 cursor-pointer',
            tab.isActive ? 'text-purple-500' : 'text-gray-300'
          ].join(' '),
          dataset: { tab: tab.key },
          title: tab.title,
          textContent: tab.icon
        })
      )
    )
  );
}