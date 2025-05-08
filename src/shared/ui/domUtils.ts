// src/shared/ui/domUtils.ts

/**
 * Generic props object passed to `h()` to define attributes, event listeners, styles, etc.
 */
export type Props = Record<string, any>;

/**
 * Generic type for any valid HTML or SVG tag name.
 */
type TagName = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;


/**
 * Flattens and filters an arbitrarily nested array of children.
 * 
 * Skips `null`, `undefined`, and `false` entries.
 * Recursively unpacks nested arrays for JSX-like syntax flexibility.
 * 
 * @param children - An array of possibly-nested elements to render inside a DOM node
 * @returns A flat array of valid strings or HTMLElements
 */
function flattenAndFilter(children: any[]): (HTMLElement | SVGElement | string)[] {
  const flat: (HTMLElement | SVGElement | string)[] = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      flat.push(...flattenAndFilter(child));
    } else if (child != null && child !== false) {
      flat.push(child);
    }
  }

  return flat;
}

/**
 * HyperScript-style helper to declaratively create DOM elements with attributes and children.
 * 
 * Example:
 * ```ts
 * const button = h('button', {
 *   class: 'btn-primary',
 *   onClick: () => alert('Clicked!'),
 *   dataset: { action: 'submit' }
 * }, 'Save');
 * ```
 * 
 * Supported features:
 * - Standard attributes (e.g. `id`, `href`, `disabled`, etc.)
 * - `class` or `className` sets the element's class string
 * - `style` can be an object of inline styles
 * - `dataset` allows assigning `data-*` attributes
 * - Event listeners via `onClick`, `onInput`, etc.
 * - Supports nested and filtered children (skips null/false)
 * 
 * @param tag - HTML tag name (e.g. 'div', 'button', 'span')
 * @param props - An object of attributes, event handlers, class/style/data
 * @param children - A variadic list of strings, elements, or nested arrays thereof
 * @returns A fully constructed HTMLElement with all attributes and children applied
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: (
    | HTMLElement
    | string
    | null
    | false
    | undefined
    | (HTMLElement | string | null | false | undefined)[]
  )[]
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
      el.setAttribute(key, String(value));
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in el) {
      (el as any)[key] = value;
    } else {
      el.setAttribute(key, String(value));
    }
  }

  const flatChildren = flattenAndFilter(children);

  for (const child of flatChildren) {
    el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  return el;
}
