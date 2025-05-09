import { h } from '../domUtils.js';
import { Drawer } from 'flowbite';
import { getCurrentSkin } from '@/userSettings/store/userConfigStore.js';

interface BottomDrawerOptions {
  id?: string;
  ariaLabel?: string;
  drawerClassOverride?: string;
  edgeOffsetClass?: string;            // e.g., "bottom-[60px]"
  toggleHandleHeightClass?: string;    // e.g., "py-6", small: "py-3"
  startExpanded?: boolean;             // default: false
}

export function createBottomDrawer(
  options: BottomDrawerOptions,
  content: HTMLElement[] = [],
  width: string = 'w-[1276px]'
): HTMLElement {
  const id = options.id || 'bottom-drawer';
  const ariaLabel = options.ariaLabel || 'Bottom drawer';
  const edgeOffset = options.edgeOffsetClass || 'bottom-[60px]';
  const drawerClass = options.drawerClassOverride || '';
  const startExpanded = options.startExpanded ?? false;
  const drawerWidth = width.toString();
  const skin = getCurrentSkin();

  // Create the drawer element
  const drawer = h('div', {
    id,
    class: [
      'fixed bottom-0 left-1/2 translate-x-[-50%] z-40',
      drawerWidth, 
      'overflow-y-auto', 'rounded-t-lg',
      skin.menuBackground, 
      skin.textColor, 
      'transition-transform',
      startExpanded ? 'translate-y-0' : 'translate-y-full',
      'border-t border-gray-200 dark:border-gray-700 pb-[20px]',
      edgeOffset,
      drawerClass
    ].join(' '),
    tabindex: '-1',
    'aria-labelledby': `${id}-label`,
    'data-drawer-placement': 'bottom',
    'data-drawer-edge': 'true',
    'data-drawer-edge-offset': edgeOffset,
  });

  // Create the toggle handle
  const toggleHandle = h('div', {
    class: [
      options.toggleHandleHeightClass || 'p-4',
      'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
    ].join(' ')
  },
    h('span', {
      class: 'absolute w-8 h-1 -translate-x-1/2 bg-gray-300 rounded-lg top-3 left-1/2 dark:bg-gray-600'
    }),
    h('h5', {
      id: `${id}-label`,
      class: 'inline-flex items-center text-base text-gray-500 dark:text-gray-400 font-medium'
    },
      ariaLabel
    )
  );

  // Append the toggle handle and content to the drawer
  drawer.appendChild(toggleHandle);
  content.forEach(el => drawer.appendChild(el));

  // Initialize the drawer using Flowbite
  const drawerInstance = new Drawer(drawer, {
    placement: 'bottom',
    edge: true,
    edgeOffset,
    backdrop: false,
    bodyScrolling: true
  }, {
    id,
    override: true
  });

  // Open it if `startExpanded` is true
  if (startExpanded) {
    drawerInstance.show();
  }

  // Toggle on click
  toggleHandle.addEventListener('click', () => {
    drawerInstance.toggle();
  });

  return drawer;
}
