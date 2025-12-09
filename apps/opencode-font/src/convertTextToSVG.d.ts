/**
 * Convert text to an SVG string using the OpenCodeLogo font.
 *
 * This implementation emits a simple SVG containing a single <text> node
 * that references the OpenCodeLogo font family. The font files (WOFF2, WOFF, TTF)
 * are included in the `fonts/` directory of this package.
 *
 * **Important**: Consumers must load the OpenCodeLogo font in their application
 * by including the font files and CSS \@font-face declaration. See the package
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
 * Convert text to an SVG string
 */
export declare const convertTextToSVG: (
  text: string | null | undefined,
  options?: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    width?: number;
    height?: number;
    includeNamespace?: boolean;
    role?: string;
    ariaLabel?: string;
  },
) => string;
/**
 * Escape XML special characters
 */
export declare const escapeXml: (unsafe: string | null | undefined) => string;
