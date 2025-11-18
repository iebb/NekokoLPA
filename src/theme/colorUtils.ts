/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
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

