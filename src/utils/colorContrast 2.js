
// Helper function to parse hex color
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper function to calculate luminance
function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates the contrast ratio between two colors.
 * @param {string} color1 - The first color in hex format (e.g., '#FFFFFF').
 * @param {string} color2 - The second color in hex format (e.g., '#000000').
 * @returns {number} The contrast ratio.
 */
export function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Please use hex colors.');
  }
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Checks if a color combination meets WCAG AA standards.
 * @param {string} color1 - The first color in hex format.
 * @param {string} color2 - The second color in hex format.
 * @param {object} [options] - Options object.
 * @param {boolean} [options.largeText=false] - Whether the text is large (18pt or 14pt bold).
 * @returns {boolean} True if the contrast is sufficient, false otherwise.
 */
export function isWcagAaCompliant(color1, color2, { largeText = false } = {}) {
  const ratio = getContrastRatio(color1, color2);
  if (largeText) {
    return ratio >= 3;
  }
  return ratio >= 4.5;
}

/**
 * Returns the best contrasting text color (black or white) for a given background color.
 * @param {string} backgroundColor - The background color in hex format.
 * @returns {string} '#000000' or '#FFFFFF'.
 */
export function getAccessibleTextColor(backgroundColor) {
  const black = '#000000';
  const white = '#FFFFFF';
  const contrastWithBlack = getContrastRatio(backgroundColor, black);
  const contrastWithWhite = getContrastRatio(backgroundColor, white);
  return contrastWithBlack > contrastWithWhite ? black : white;
}
