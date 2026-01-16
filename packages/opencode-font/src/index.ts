// ============================================================================
// Simple Font-Based SVG Generation
// ============================================================================

export { convertTextToSVG } from './convertTextToSVG';

// ============================================================================
// Blocky Pixel-Art Text Rendering
// ============================================================================

export { blockyTextToSVG, textToBlocks, calculateWidth, blocksToSVGPaths } from './alphabet';

export type { Block, BlockyTextOptions } from './alphabet';

// ============================================================================
// Alphabet System - Advanced Usage
// ============================================================================

export type { Glyph, CellType, LetterName, SymbolName, Alphabet, Symbols } from './alphabet';

export {
  cellType,
  ALPHABET,
  SYMBOLS,
  getAvailableCharacters,
  getAvailableSymbols,
  getAllAvailableCharacters,
} from './alphabet';

// ============================================================================
// Theme System
// ============================================================================

export type { Theme, ThemeType } from './alphabet';

export { themeType, lightTheme, darkTheme, getColorFromLetter } from './alphabet';

// ============================================================================
// SVG Optimization
// ============================================================================

export { optimizeBlocksToSVGPaths } from './alphabet';
