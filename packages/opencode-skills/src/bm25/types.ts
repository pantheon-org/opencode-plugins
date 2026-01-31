/**
 * BM25 Type Definitions
 *
 * Type definitions for BM25 scoring system.
 */

/**
 * BM25 configuration parameters
 */
export interface BM25Config {
  /** Term frequency saturation parameter (default: 1.5) */
  k1?: number;
  /** Length normalization parameter (default: 0.75) */
  b?: number;
  /** Minimum score threshold for injection (default: 0.0) */
  threshold?: number;
  /** Enable BM25 scoring (default: false) */
  enabled?: boolean;
  /** Maximum number of skills to inject (default: 3) */
  maxSkills?: number;
}

/**
 * Precomputed document statistics for BM25 scoring
 */
export interface BM25Index {
  /** Tokenized documents */
  documents: string[][];
  /** Average document length */
  avgDocLength: number;
  /** Total number of documents */
  totalDocs: number;
  /** IDF cache for terms */
  idfCache: Map<string, number>;
}

/**
 * Default BM25 configuration
 */
export const DEFAULT_BM25_CONFIG: Required<BM25Config> = {
  k1: 1.5,
  b: 0.75,
  threshold: 0.0,
  enabled: false,
  maxSkills: 3,
};
