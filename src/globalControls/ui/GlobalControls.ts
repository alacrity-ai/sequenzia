import { h } from '@/shared/ui/domUtils.js';
import { createBottomDrawer } from '@/shared/ui/primitives/createBottomDrawer.js';
import { GLOBAL_CONFIG_CONTROLS_WIDTH } from '../constants.js';

export class GlobalControls {
  private drawer: HTMLElement;

  private globalPlayheadRow: HTMLElement;
  private globalToolsRow: HTMLElement;
  private globalTransportRow: HTMLElement;

  constructor() {
    this.globalPlayheadRow = h('div', {
      id: 'global-playhead-row',
      class: 'w-full mb-2'
    });

    this.globalToolsRow = h('div', {
      id: 'global-tools-row',
      class: 'w-full mb-2'
    });

    this.globalTransportRow = h('div', {
      id: 'global-transport-row',
      class: 'w-full'
    });

    const drawer = createBottomDrawer({
      id: 'global-controls-drawer',
      ariaLabel: ' ',
      edgeOffsetClass: 'bottom-[40px]',
      toggleHandleHeightClass: 'py-2',
      startExpanded: true,
    }, [
      this.globalPlayheadRow,
      this.globalToolsRow,
      this.globalTransportRow
    ], GLOBAL_CONFIG_CONTROLS_WIDTH);

    this.drawer = drawer;

    const footer = document.getElementById('footer-main');
    if (footer) {
      footer.appendChild(this.drawer);
    } else {
      console.warn('footer-main container not found. GlobalControls not injected.');
    }
  }

  public render(): HTMLElement {
    return this.drawer;
  }

  public destroy(): void {
    this.drawer.remove();
  }

  public getGlobalPlayheadRow(): HTMLElement {
    return this.globalPlayheadRow;
  }

  public getGlobalToolsRow(): HTMLElement {
    return this.globalToolsRow;
  }

  public getGlobalTransportRow(): HTMLElement {
    return this.globalTransportRow;
  }
}
