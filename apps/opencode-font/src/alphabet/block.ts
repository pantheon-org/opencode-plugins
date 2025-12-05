import { cellType, type CellType } from './types';
import { getColorFromLetter, themeType, type ThemeType } from './theme';
import { ALPHABET, SYMBOLS } from './types';
import { optimizeBlocksToSVGPaths } from './svg-optimizer';

export interface BlockyTextOptions {
  theme?: ThemeType;
  /** Size of each block in pixels */
  blockSize?: number;
  /** Spacing between characters */
  charSpacing?: number;
  /** Enable SVG path optimization (merges adjacent blocks) */
  optimize?: boolean;
}

export type Block = {
  x: number;
  y: number;
  color: string;
};

const DEFAULT_BLOCKY_TEXT_OPTIONS: Required<BlockyTextOptions> = {
  theme: themeType.LIGHT,
  blockSize: 6, // OpenCode.ai uses 6px blocks
  charSpacing: 1, // 1 block spacing = 6px with blockSize=6
  optimize: true, // Enable optimization by default for smaller file sizes
};

/**
 * Get character data from ALPHABET or SYMBOLS
 */
const getCharData = (char: string) => {
  return ALPHABET[char as keyof typeof ALPHABET] || SYMBOLS[char as keyof typeof SYMBOLS];
};

/**
 * Calculate the number of columns for a character
 */
const getCharColumns = (rowsObj: Record<number, number[]>): number => {
  return Math.max(...Object.values(rowsObj).map((r) => (Array.isArray(r) ? r.length : 0)));
};

/**
 * Convert raw cell value to cellType
 */
const normalizeCellValue = (raw: number | CellType | undefined, row: number): CellType => {
  if (typeof raw !== 'number') {
    return raw || cellType.BLANK;
  }

  if (raw === 1) {
    // Auto-assign based on row: rows 3-5 use SECONDARY, others use PRIMARY
    return row >= 3 && row <= 5 ? cellType.SECONDARY : cellType.PRIMARY;
  } else if (raw === 2) {
    return cellType.SECONDARY;
  } else if (raw === 3) {
    return cellType.TERTIARY;
  }

  return cellType.BLANK;
};

/**
 * Process a single character and add its blocks
 */
const processCharacter = (
  char: string,
  xOffset: number,
  blocks: Block[],
  options: { theme: ThemeType; blockSize: number; charSpacing: number },
): number => {
  const { theme, blockSize, charSpacing } = options;
  const charData = getCharData(char);

  if (!charData) {
    console.warn(`Character "${char}" not found in alphabet data. Skipping.`);
    return xOffset + blockSize + charSpacing;
  }

  const rowsObj = charData.rows as Record<number, number[]>;
  const cols = getCharColumns(rowsObj);

  for (let row = 0; row < 7; row++) {
    const rowArr = rowsObj[row] || [];
    for (let col = 0; col < cols; col++) {
      const raw = rowArr[col];
      const cellValue = normalizeCellValue(raw, row);

      // Skip undefined or blank cells
      if (!cellValue || cellValue === cellType.BLANK) continue;

      const color = getColorFromLetter(charData, theme, cellValue);
      blocks.push({
        x: xOffset + col * blockSize,
        y: row * blockSize,
        color,
      });
    }
  }

  return xOffset + cols * blockSize + charSpacing * blockSize;
};

export const textToBlocks = (
  text: string,
  options: Required<BlockyTextOptions> = DEFAULT_BLOCKY_TEXT_OPTIONS,
): Block[] => {
  const { theme = themeType.LIGHT, blockSize = 20, charSpacing = 5 } = options;
  const blocks: Block[] = [];
  let xOffset = 0;

  for (const char of text.toUpperCase()) {
    xOffset = processCharacter(char, xOffset, blocks, { theme, blockSize, charSpacing });
  }

  return blocks;
};

/**
 * Calculate the width of the rendered text
 */
export const calculateWidth = (text: string, options: Required<BlockyTextOptions>): number => {
  const { blockSize, charSpacing } = options;
  let totalWidth = 0;

  for (const char of text.toUpperCase()) {
    const charData =
      ALPHABET[char as keyof typeof ALPHABET] || SYMBOLS[char as keyof typeof SYMBOLS];
    if (!charData) {
      // For missing characters, assume 4-column width
      totalWidth += 4 * blockSize + charSpacing * blockSize;
      continue;
    }

    // Calculate actual column width for this character
    const rowsObj = charData.rows as Record<number, number[]>;
    const cols = Math.max(...Object.values(rowsObj).map((r) => (Array.isArray(r) ? r.length : 0)));

    totalWidth += cols * blockSize + charSpacing * blockSize;
  }

  // Remove trailing charSpacing
  return totalWidth - charSpacing * blockSize;
};

/**
 * Generate SVG path elements from blocks
 */
export const blocksToSVGPaths = (blocks: Block[], blockSize: number): string => {
  return blocks
    .map(
      (block) =>
        `<path d="M${block.x} ${block.y}H${block.x + blockSize}V${block.y + blockSize}H${block.x}V${block.y}Z" fill="${block.color}"/>`,
    )
    .join('\n\t\t');
};

/**
 * Convert text to blocky pixel-art SVG
 *
 * @param text - Text to convert (supports A-Z and symbols: -, |, ', ", ?, !)
 * @param options - Customization options
 * @returns SVG string
 *
 * @example
 * ```ts
 * const svg = blockyTextToSVG('OPENCODE');
 * ```
 */
export const blockyTextToSVG = (text: string, options: BlockyTextOptions = {}): string => {
  const opts = { ...DEFAULT_BLOCKY_TEXT_OPTIONS, ...options };
  const blocks = textToBlocks(text, opts);
  const width = calculateWidth(text, opts);
  const height = 7 * opts.blockSize; // 7 rows to match OpenCode logo

  // Use optimized or unoptimized path generation
  const paths = opts.optimize
    ? optimizeBlocksToSVGPaths(blocks, opts.blockSize).join('\n')
    : blocksToSVGPaths(blocks, opts.blockSize);

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
${paths}
</svg>`;
};
