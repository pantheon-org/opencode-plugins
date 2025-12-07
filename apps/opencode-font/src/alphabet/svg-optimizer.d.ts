/**
 * SVG Path Optimizer
 *
 * Merges adjacent blocks with the same color into optimized compound paths.
 * This reduces file size and improves rendering performance.
 *
 * @module svg-optimizer
 */
import type { Block } from './block';
/**
 * Optimize blocks into merged SVG path elements
 *
 * @param blocks - Array of blocks to optimize
 * @param blockSize - Size of each block in pixels
 * @returns Array of optimized SVG path strings
 *
 * @example
 * ```ts
 * const blocks = textToBlocks('HELLO');
 * const paths = optimizeBlocksToSVGPaths(blocks, 6);
 * // Returns merged paths, one per color
 * ```
 */
export declare const optimizeBlocksToSVGPaths: (blocks: Block[], blockSize: number) => string[];
