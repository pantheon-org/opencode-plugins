import {
  letterA,
  letterB,
  letterC,
  letterD,
  letterE,
  letterF,
  letterG,
  letterH,
  letterI,
  letterJ,
  letterK,
  letterL,
  letterM,
  letterN,
  letterO,
  letterP,
  letterQ,
  letterR,
  letterS,
  letterT,
  letterU,
  letterV,
  letterW,
  letterX,
  letterY,
  letterZ,
  symbolHyphen,
  symbolPipe,
  symbolApostrophe,
  symbolQuote,
  symbolQuestion,
  symbolExclamation,
} from './glyphs';
/**
 * Cell type constants for defining the visual appearance of glyph cells.
 *
 * Each cell in a glyph grid can be one of three types:
 * - BLANK: Empty/transparent cell (no visual representation)
 * - PRIMARY: Main color cell (foreground color in light theme, bright in dark theme)
 * - SECONDARY: Accent color cell (for shading, depth, and visual interest)
 *
 * @example
 * ```typescript
 * import { cellType } from './types';
 *
 * const cell = cellType.PRIMARY; // "primary"
 * const isBlank = cell === cellType.BLANK; // false
 * ```
 */
export const cellType = {
  BLANK: 'blank',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
};
export const ALPHABET = {
  A: letterA,
  B: letterB,
  C: letterC,
  D: letterD,
  E: letterE,
  F: letterF,
  G: letterG,
  H: letterH,
  I: letterI,
  J: letterJ,
  K: letterK,
  L: letterL,
  M: letterM,
  N: letterN,
  O: letterO,
  P: letterP,
  Q: letterQ,
  R: letterR,
  S: letterS,
  T: letterT,
  U: letterU,
  V: letterV,
  W: letterW,
  X: letterX,
  Y: letterY,
  Z: letterZ,
};
/**
 * Collection of symbol glyphs for punctuation and special characters.
 *
 * This object maps symbol characters to their glyph definitions, allowing
 * symbols to be rendered alongside letters in the blocky text system.
 *
 * Available symbols:
 * - `-` (hyphen): Horizontal line for compound words
 * - `|` (pipe): Vertical line for separators
 * - `'` (apostrophe): Single quote mark for contractions
 * - `"` (quote): Double quote marks for quoted text
 * - `?` (question): Question mark for interrogatives
 * - `!` (exclamation): Exclamation point for emphasis
 *
 * @example
 * ```typescript
 * import { SYMBOLS } from './types';
 *
 * const hyphen = SYMBOLS['-'];
 * const question = SYMBOLS['?'];
 * ```
 *
 * @see {@link Glyph} for the structure of symbol definitions
 * @see {@link SymbolName} for the type of available symbols
 */
export const SYMBOLS = {
  '-': symbolHyphen,
  '|': symbolPipe,
  "'": symbolApostrophe,
  '"': symbolQuote,
  '?': symbolQuestion,
  '!': symbolExclamation,
};
/**
 * Get available characters in the font (letters only)
 */
export const getAvailableCharacters = () => {
  return Object.keys(ALPHABET);
};
/**
 * Get available symbols in the font
 */
export const getAvailableSymbols = () => {
  return Object.keys(SYMBOLS);
};
/**
 * Get all available characters (letters and symbols combined)
 */
export const getAllAvailableCharacters = () => {
  return [...Object.keys(ALPHABET), ...Object.keys(SYMBOLS)];
};
//# sourceMappingURL=types.js.map
