/**
 * Convert text to an SVG string using the OpenCodeLogo font.
 *
 * This implementation emits a simple SVG containing a single <text> node
 * that references the OpenCodeLogo font family. The font files (WOFF2, WOFF, TTF)
 * are included in the `fonts/` directory of this package.
 *
 * **Important**: Consumers must load the OpenCodeLogo font in their application
 * by including the font files and CSS @font-face declaration. See the package
 * `fonts/` directory and `css/opencode-font.css` for reference.
 *
 * @param text - The text to convert to SVG (supports A-Z and symbols: - | ' " ? !)
 * @param options - Configuration options for the SVG output
 * @returns An SVG string with a <text> element using the OpenCodeLogo font
 *
 * @example
 * ```typescript
 * import { convertTextToSVG } from '@pantheon-ai/opencode-font';
 *
 * // Basic usage
 * const svg = convertTextToSVG('HELLO');
 *
 * // With custom options
 * const customSvg = convertTextToSVG('OPENCODE', {
 *   fontSize: 72,
 *   color: '#667eea',
 *   width: 800,
 *   height: 100
 * });
 * ```
 */

/**
 * Build SVG attributes from options
 */
const buildSVGAttributes = (options: {
  width?: number;
  height?: number;
  includeNamespace?: boolean;
  role?: string;
  ariaLabel?: string;
}): string => {
  const { width, height, includeNamespace = true, role, ariaLabel } = options;

  const ns = includeNamespace ? 'xmlns="http://www.w3.org/2000/svg"' : '';
  const wAttr = width ? ` width="${width}"` : '';
  const hAttr = height ? ` height="${height}"` : '';
  const roleAttr = role ? ` role="${role}"` : '';
  const ariaAttr = ariaLabel ? ` aria-label="${ariaLabel}"` : '';

  return `${ns}${wAttr}${hAttr} viewBox="0 0 100 20"${roleAttr}${ariaAttr}`;
};

/**
 * Build text element with font styling
 */
const buildTextElement = (
  text: string,
  fontSize: number,
  fontFamily: string,
  color: string,
): string => {
  return `<text x="0" y="14" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}">${escapeXml(text)}</text>`;
};

/**
 * Convert text to an SVG string
 */
export const convertTextToSVG = (
  text: string | null | undefined,
  options: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    width?: number;
    height?: number;
    includeNamespace?: boolean;
    role?: string;
    ariaLabel?: string;
  } = {},
): string => {
  const { fontSize = 48, color = '#000', fontFamily = 'OpenCodeLogo' } = options;

  const safeText = text == null ? '' : String(text);
  const svgAttrs = buildSVGAttributes(options);
  const textElement = buildTextElement(safeText, fontSize, fontFamily, color);

  return `<svg ${svgAttrs}>
  ${textElement}
</svg>`;
};

/**
 * Escape XML special characters
 */
export const escapeXml = (unsafe: string | null | undefined): string => {
  return unsafe == null
    ? ''
    : String(unsafe).replace(/[&<>\"']/g, (c) => {
        switch (c) {
          case '&':
            return '&amp;';
          case '<':
            return '&lt;';
          case '>':
            return '&gt;';
          case '"':
            return '&quot;';
          case "'":
            return '&apos;';
          default:
            return c;
        }
      });
};

// lefthook test
