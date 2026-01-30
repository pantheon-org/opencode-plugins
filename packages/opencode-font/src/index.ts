// ============================================================================
// Simple Font-Based SVG Generation
// ============================================================================

export { convertTextToSVG } from './convertTextToSVG';

// ============================================================================
// Blocky Pixel-Art Text Rendering
// ============================================================================

export type { Block, BlockyTextOptions } from './alphabet';
export { blocksToSVGPaths, blockyTextToSVG, calculateWidth, textToBlocks } from './alphabet';

// ============================================================================
// Alphabet System - Advanced Usage
// ============================================================================

export type { Alphabet, CellType, Glyph, LetterName, SymbolName, Symbols } from './alphabet';

export {
  ALPHABET,
  cellType,
  getAllAvailableCharacters,
  getAvailableCharacters,
  getAvailableSymbols,
  SYMBOLS,
} from './alphabet';

// ============================================================================
// Theme System
// ============================================================================

export type { Theme, ThemeType } from './alphabet';

export { darkTheme, getColorFromLetter, lightTheme, themeType } from './alphabet';

// ============================================================================
// SVG Optimization
// ============================================================================

export { optimizeBlocksToSVGPaths } from './alphabet';
