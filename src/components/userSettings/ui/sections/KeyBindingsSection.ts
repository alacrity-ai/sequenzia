// src/components/userSettings/ui/sections/KeyBindingsSection.ts

import { h } from '@/shared/ui/domUtils.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { createLabel } from '@/shared/ui/primitives/createLabel.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { createHorizontalDivider } from '@/shared/ui/primitives/createHorizontalDivider.js';

import { getAllKeyMacroBindings } from '@/shared/keybindings/KeyMacroStore.js';
import type { KeyMacroName } from '@/shared/keybindings/interfaces/KeyMacroDefinitions.js';
import type { KeyMacroBinding } from '@/shared/keybindings/interfaces/KeyMacroBinding.js';
import { KeyMacroSections } from '@/shared/keybindings/KeyMacroSections.js';

export interface KeyBindingsSectionController {
  element: HTMLElement;
  bindings: {
    macroName: KeyMacroName;
    labelEl: HTMLElement;
    buttonEl: HTMLButtonElement;
  }[];
  refreshToggle: () => void;
}

/**
 * Creates a UI section for displaying and rebinding key macros.
 */
export function createKeyBindingsSection(): KeyBindingsSectionController {
  const bindings: KeyBindingsSectionController['bindings'] = [];
  const sectionBody = h('div', { className: 'flex flex-col gap-y-4' });

  const currentBindings = getAllKeyMacroBindings();

  for (const sectionDef of KeyMacroSections) {
    const sectionHeader = createLabel(sectionDef.name);
        
    const grid = h('div', { className: 'grid gap-y-3 grid-cols-[200px_1fr_auto]' });

    for (const macroName of sectionDef.macros) {
      const currentBinding = currentBindings[macroName];
      const bindingText = formatBindingDisplay(currentBinding);

      const actionLabel = createLabel(macroName);

      const bindingLabel = h('span', {
        className: 'text-sm text-gray-300 self-center'
      }, bindingText);

      const rebindButton = createButton({
        text: 'Rebind',
        kind: 'secondary',
        additionalClasses: 'px-4 py-2'
      });

      bindings.push({
        macroName,
        labelEl: bindingLabel,
        buttonEl: rebindButton
      });

      grid.appendChild(actionLabel);
      grid.appendChild(bindingLabel);
      grid.appendChild(rebindButton);
    }

    sectionBody.appendChild(sectionHeader);
    if (sectionDef.description) {
      sectionBody.appendChild(h('p', { className: 'text-xs text-gray-400' }, sectionDef.description));
    }
    sectionBody.appendChild(grid);
    sectionBody.appendChild(createHorizontalDivider());
  }

  const resetButton = createButton({
    id: 'keybindings-reset-btn',
    text: 'Reset to Defaults',
    kind: 'tertiary',
    additionalClasses: 'self-start px-4 py-2'
  });
  sectionBody.appendChild(resetButton);

  const section = h('div', {},
    createHeader('Key Bindings'),
    sectionBody
  );

  const refreshToggle = () => {
    const updatedBindings = getAllKeyMacroBindings();

    for (const binding of bindings) {
      const current = updatedBindings[binding.macroName];
      binding.labelEl.textContent = formatBindingDisplay(current);
    }
  };

  return {
    element: section,
    bindings,
    refreshToggle
  };
}

/**
 * Helper: Formats a KeyMacroBinding or array for display.
 */
function formatBindingDisplay(binding: KeyMacroBinding | KeyMacroBinding[]): string {
  const formatSingle = (b: KeyMacroBinding): string => {
    const mods = [
      b.ctrl ? 'Ctrl' : '',
      b.shift ? 'Shift' : '',
      b.alt ? 'Alt' : '',
      b.meta ? 'Meta' : ''
    ].filter(Boolean);

    return [...mods, b.code].join('+');
  };

  return Array.isArray(binding)
    ? binding.map(formatSingle).join(' / ')
    : formatSingle(binding);
}