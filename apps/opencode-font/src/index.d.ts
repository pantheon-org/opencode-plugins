export { convertTextToSVG } from './convertTextToSVG';
export { blockyTextToSVG, textToBlocks, calculateWidth, blocksToSVGPaths } from './alphabet';
export type { Block, BlockyTextOptions } from './alphabet';
export type { Glyph, CellType, LetterName, SymbolName, Alphabet, Symbols } from './alphabet';
export {
  cellType,
  ALPHABET,
  SYMBOLS,
  getAvailableCharacters,
  getAvailableSymbols,
  getAllAvailableCharacters,
} from './alphabet';
export type { Theme, ThemeType } from './alphabet';
export { themeType, lightTheme, darkTheme, getColorFromLetter } from './alphabet';
export { optimizeBlocksToSVGPaths } from './alphabet';
