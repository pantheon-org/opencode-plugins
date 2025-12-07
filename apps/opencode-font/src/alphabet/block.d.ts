import { type ThemeType } from './theme';
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
export declare const textToBlocks: (text: string, options?: Required<BlockyTextOptions>) => Block[];
/**
 * Calculate the width of the rendered text
 */
export declare const calculateWidth: (text: string, options: Required<BlockyTextOptions>) => number;
/**
 * Generate SVG path elements from blocks
 */
export declare const blocksToSVGPaths: (blocks: Block[], blockSize: number) => string;
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
export declare const blockyTextToSVG: (text: string, options?: BlockyTextOptions) => string;
