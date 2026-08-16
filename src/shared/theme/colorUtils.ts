/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): {r: number; g: number; b: number} | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * Determine if a color is dark (similar to Colors.isDark)
 */
export function isDarkColor(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return false;

  // Calculate relative luminance (same formula used in WCAG)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}

/**
 * Get a tint of a color (similar to Colors.getColorTint)
 * @param color - Hex color string
 * @param tint - Tint value (0-100):
 *   - 0 = pure color
 *   - 50 = gray (midpoint)
 *   - 100 = white
 *   Higher values = lighter, lower values = darker
 */
export function getColorTint(color: string, tint: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  // Clamp tint between 0 and 100
  const clampedTint = Math.max(0, Math.min(100, tint));

  // Calculate target color based on tint
  // tint = 0: original color
  // tint = 50: gray (128)
  // tint = 100: white (255)
  const target = (clampedTint / 100) * 255;

  // Interpolate between original color and target
  const r = rgb.r + (target - rgb.r) * (clampedTint / 100);
  const g = rgb.g + (target - rgb.g) * (clampedTint / 100);
  const b = rgb.b + (target - rgb.b) * (clampedTint / 100);

  return rgbToHex(r, g, b);
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** Convert a `#rgb` or `#rrggbb` hex string to HSL (h 0-360, s/l 0-100). */
export function hexToHsl(hex: string): Hsl {
  const parsed = hex.replace('#', '');
  const full =
    parsed.length === 3
      ? parsed
          .split('')
          .map(c => c + c)
          .join('')
      : parsed;
  const bigint = parseInt(full, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100)};
}

/** Convert HSL (h 0-360, s/l 0-100) to an uppercase `#RRGGBB` hex string. */
export function hslToHex(h: number, s: number, l: number): string {
  const s1 = s / 100;
  const l1 = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s1 * Math.min(l1, 1 - l1);
  const f = (n: number) => l1 - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}
