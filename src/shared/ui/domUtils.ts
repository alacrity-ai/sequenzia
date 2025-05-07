// src/userSettings/ui/helpers/domUtils.ts
export type Props = Record<string, any>;

export function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: Props = {},
    ...children: (HTMLElement | string | null | false | undefined)[]
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
  
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue;
  
      if (key === 'class' || key === 'className') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          if (v != null) (el.style as any)[k] = v;
        }
      } else if (key === 'dataset' && typeof value === 'object') {
        for (const [dataKey, dataVal] of Object.entries(value)) {
          el.dataset[dataKey] = String(dataVal);
        }
      } else if (key.startsWith('data-')) {
        el.setAttribute(key, String(value)); // ✅ Add support for direct data-* attributes
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key in el) {
        (el as any)[key] = value;
      } else {
        el.setAttribute(key, String(value));
      }
    }
  
    for (const child of children.flat()) {
      if (child == null || child === false) continue;
      el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  
    return el;
  }

  