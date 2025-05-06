// src/sequencer/matrix/utils/colorConversion.ts

/**
 * Converts a hex or HSL color string to an RGBA string with the given alpha.
 * If the input is already a valid RGB/RGBA/HSL format, it defaults to returning the original color.
 */
export function colorToRgba(color: string, alpha: number = 1.0): string {
    if (color.startsWith('#')) {
      const bigint = parseInt(color.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  
    if (color.startsWith('hsl(')) {
      // Convert hsl(h, s%, l%) to rgba
      const [h, s, l] = color
        .slice(4, -1)
        .split(',')
        .map(part => parseFloat(part.trim()));
      const [r, g, b] = hslToRgb(h, s / 100, l / 100);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  
    // Default fallback: if the color isn't recognized, just return it as-is
    return color;
  }
  
  /**
   * Converts HSL color values to RGB.
   * Input h in [0,360], s and l in [0,1].
   * Returns RGB values in [0,255].
   */
  export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
  
    if (0 <= h && h < 60)        [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180)[r, g, b] = [0, c, x];
    else if (180 <= h && h < 240)[r, g, b] = [0, x, c];
    else if (240 <= h && h < 300)[r, g, b] = [x, 0, c];
    else if (300 <= h && h < 360)[r, g, b] = [c, 0, x];
  
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }
  
  export function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b);
  
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!match) return null;
  
    const r = parseInt(match[1], 16) / 255;
    const g = parseInt(match[2], 16) / 255;
    const b = parseInt(match[3], 16) / 255;
  
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
  
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
  
    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }
  