// src/shared/keybindings/ShortcutUtils.ts

export function normalizeKeyCombo(combo: string): string {
  console.debug('[normalizeKeyCombo] Raw combo:', combo);

  const parts = combo.split('+').map(p => p.trim());

  const modifiers = {
    control: parts.some(p => p.toLowerCase() === 'ctrl' || p.toLowerCase() === 'control'),
    shift: parts.some(p => p.toLowerCase() === 'shift'),
    alt: parts.some(p => p.toLowerCase() === 'alt'),
    meta: parts.some(p => p.toLowerCase() === 'meta'),
  };

  const mainKey = parts.find(p =>
    !['ctrl', 'control', 'shift', 'alt', 'meta'].includes(p.toLowerCase())
  );

  console.debug('[normalizeKeyCombo] Modifiers:', modifiers, 'Main key:', mainKey);

  const orderedParts = [];
  if (modifiers.control) orderedParts.push('Control');
  if (modifiers.shift) orderedParts.push('Shift');
  if (modifiers.alt) orderedParts.push('Alt');
  if (modifiers.meta) orderedParts.push('Meta');

  if (mainKey) {
    const knownCodes = [
      'Space', 'Tab', 'Enter', 'Escape', 'Period', 'Slash', 'Comma',
    ];
    if (mainKey.startsWith('Key') || mainKey.startsWith('Digit') ||
        mainKey.startsWith('Control') ||
        knownCodes.includes(mainKey)) {
      orderedParts.push(mainKey); // Already normalized code
      console.debug('[normalizeKeyCombo] Main key is already normalized:', mainKey);
    } else {
      const code = mapToKeyboardCode(mainKey.toLowerCase());
      if (code) {
        orderedParts.push(code);
        console.debug('[normalizeKeyCombo] Converted main key:', mainKey, 'to', code);
      } else {
        orderedParts.push(mainKey.toUpperCase());
        console.debug('[normalizeKeyCombo] Unknown key, uppercased:', mainKey.toUpperCase());
      }
    }
  }

  const result = orderedParts.join('+');
  console.debug('[normalizeKeyCombo] Final normalized combo:', result);

  return result;
}

export function isShortcutMatch(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.split('+');

  const required = {
    control: parts.includes('Control'),
    shift: parts.includes('Shift'),
    alt: parts.includes('Alt'),
    meta: parts.includes('Meta'),
  };

  const expectedKey = parts.find(p =>
    !['Control', 'Shift', 'Alt', 'Meta'].includes(p)
  );

  console.debug('[isShortcutMatch] Event.code:', e.code, 'Expected key:', expectedKey);
  console.debug('[isShortcutMatch] Modifiers - Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey, 'Alt:', e.altKey, 'Meta:', e.metaKey);

  // === Special case: when expectedKey is a modifier keycode (e.g. ControlLeft) ===
  const isModifierKeyCode = expectedKey?.startsWith('Control') ||
                            expectedKey?.startsWith('Shift') ||
                            expectedKey?.startsWith('Alt') ||
                            expectedKey?.startsWith('Meta');

  const modifierMatch = isModifierKeyCode
    ? true // Don't enforce e.ctrlKey === false etc. when pressing modifier keys as primary keys
    : (
        e.ctrlKey === required.control &&
        e.shiftKey === required.shift &&
        e.altKey === required.alt &&
        e.metaKey === required.meta
      );

  const match = modifierMatch && e.code === expectedKey;

  console.debug('[isShortcutMatch] Match result:', match);

  return match;
}

function mapToKeyboardCode(key: string): string | null {
  if (key.length === 1) {
    const char = key.toLowerCase();
    if (char >= 'a' && char <= 'z') return `Key${char.toUpperCase()}`;
    if (char >= '0' && char <= '9') return `Digit${char}`;
  }

  const specialKeys: Record<string, string> = {
    'space': 'Space',
    'tab': 'Tab',
    'enter': 'Enter',
    'escape': 'Escape',
    '.': 'Period',
    '/': 'Slash',
    ',': 'Comma',
  };

  return specialKeys[key] ?? null;
}

export function buildKeyComboFromEvent(e: KeyboardEvent): string {
  const parts = [];
  if (e.ctrlKey) parts.push('Control');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  if (e.metaKey) parts.push('Meta');
  parts.push(e.code); // e.g., KeyD, Digit1
  return parts.join('+');
}
