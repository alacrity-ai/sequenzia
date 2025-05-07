// src/shared/ui/primitives/createTabBar.ts
import { h } from '../domUtils.js';

export interface TabDefinition {
  key: string;               // e.g., "global-settings"
  icon: string;              // e.g., "⚙️"
  title: string;             // tooltip/title
  isActive?: boolean;        // whether this is the default active tab
}

export function createTabBar(tabs: TabDefinition[]): HTMLElement {
  return h('div', {
    class: 'flex justify-between items-center mb-6 border-b border-purple-700 pb-2 z-10'
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
