import { h } from '@/shared/ui/domUtils.js';
import { createHeader } from '@/shared/ui/primitives/createHeader.js';
import { createLabel } from '@/shared/ui/primitives/createLabel.js';
import { createButton } from '@/shared/ui/primitives/createButton.js';
import { KeyMacroNames, KeyMacroName } from '@/shared/keybindings/KeyMacroDefinitions.js';
import { KeyMacros } from '@/shared/keybindings/KeyMacros.js';

export interface KeyBindingsSectionController {
  element: HTMLElement;
  bindings: {
    macroName: KeyMacroName;
    labelEl: HTMLElement;
    buttonEl: HTMLButtonElement;
  }[];
  refreshToggle: () => void;
}

export function createKeyBindingsSection(): KeyBindingsSectionController {
  const bindings: KeyBindingsSectionController['bindings'] = [];

  const sectionBody = h('div', { className: 'grid gap-y-3 grid-cols-[150px_1fr_auto]' });

  // === Generate Rows for Each Macro ===
  for (const macroName of Object.keys(KeyMacroNames) as KeyMacroName[]) {
    const currentBinding = KeyMacros[macroName];
    const bindingText = Array.isArray(currentBinding) ? currentBinding.join(' / ') : currentBinding;

    const actionLabel = createLabel(macroName);

    const bindingLabel = h('span', {
      className: 'text-sm text-gray-300 self-center'
    }, bindingText);

    const rebindButton = createButton({
      text: 'Rebind',
      kind: 'secondary'
    });

    // === Push into bindings for listener attachment later ===
    bindings.push({
      macroName,
      labelEl: bindingLabel,
      buttonEl: rebindButton
    });

    // === Append to grid layout ===
    sectionBody.appendChild(actionLabel);
    sectionBody.appendChild(bindingLabel);
    sectionBody.appendChild(rebindButton);
  }

  const section = h('div', {},
    createHeader('Key Bindings'),
    sectionBody
  );

  const refreshToggle = () => {
    for (const binding of bindings) {
      const current = KeyMacros[binding.macroName];
      const bindingText = Array.isArray(current) ? current.join(' / ') : current;
      binding.labelEl.textContent = bindingText;
    }
  };

  return {
    element: section,
    bindings,
    refreshToggle
  };
}
