/**
 * BM25 (Best Matching 25) probabilistic ranking function for skill relevance scoring
 *
 * BM25 is a bag-of-words retrieval function that ranks documents based on
 * term frequency, inverse document frequency, and document length normalization.
 *
 * Formula: BM25(D, Q) = Σ IDF(qi) * (f(qi, D) * (k1 + 1)) / (f(qi, D) + k1 * (1 - b + b * |D| / avgdl))
 *
 * Where:
 * - D: Document (skill content)
 * - Q: Query (user message)
 * - qi: Query term i
 * - f(qi, D): Term frequency of qi in D
 * - |D|: Document length
 * - avgdl: Average document length
 * - k1: Term frequency saturation parameter (typically 1.2-2.0)
 * - b: Length normalization parameter (typically 0.75)
 * - IDF(qi): Inverse document frequency of qi
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
}

/**
 * Default BM25 configuration
 */
const DEFAULT_BM25_CONFIG: Required<BM25Config> = {
  k1: 1.5,
  b: 0.75,
  threshold: 0.0,
  enabled: false,
};

/**
 * Tokenize text into lowercase words, removing punctuation
 */
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Keep hyphens for skill names
    .split(/\s+/)
    .filter((token) => token.length > 0);
};

/**
 * Calculate term frequency in a document
 */
const termFrequency = (term: string, document: string[]): number => {
  return document.filter((t) => t === term).length;
};

/**
 * Calculate inverse document frequency
 *
 * IDF(t) = ln((N - df(t) + 0.5) / (df(t) + 0.5) + 1)
 *
 * Where:
 * - N: Total number of documents
 * - df(t): Number of documents containing term t
 */
const inverseDocumentFrequency = (term: string, documents: string[][], totalDocs: number): number => {
  const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;
  return Math.log((totalDocs - docsWithTerm + 0.5) / (docsWithTerm + 0.5) + 1);
};

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
 * Build BM25 index from skill content
 *
 * @param skills - Map of skill name to skill content
 * @returns Precomputed BM25 index
 */
export const buildBM25Index = (skills: Map<string, string>): BM25Index => {
  const documents: string[][] = [];
  const skillNames: string[] = [];

  // Tokenize all skill content
  for (const [name, content] of skills.entries()) {
    // Combine skill name, description, and content for indexing
    const combinedText = `${name} ${content}`;
    documents.push(tokenize(combinedText));
    skillNames.push(name);
  }

  // Calculate average document length
  const totalLength = documents.reduce((sum, doc) => sum + doc.length, 0);
  const avgDocLength = totalLength / documents.length;

  // Precompute IDF for all unique terms
  const allTerms = new Set<string>();
  for (const doc of documents) {
    for (const term of doc) {
      allTerms.add(term);
    }
  }

  const idfCache = new Map<string, number>();
  for (const term of allTerms) {
    idfCache.set(term, inverseDocumentFrequency(term, documents, documents.length));
  }

  return {
    documents,
    avgDocLength,
    totalDocs: documents.length,
    idfCache,
  };
};

/**
 * Calculate BM25 score for a query against a document
 *
 * @param query - User message/query
 * @param docIndex - Document index in the BM25 index
 * @param index - Precomputed BM25 index
 * @param config - BM25 configuration parameters
 * @returns BM25 relevance score
 */
export const calculateBM25Score = (
  query: string,
  docIndex: number,
  index: BM25Index,
  config: BM25Config = {},
): number => {
  const { k1, b } = { ...DEFAULT_BM25_CONFIG, ...config };

  const queryTerms = tokenize(query);
  const document = index.documents[docIndex];
  const docLength = document.length;

  let score = 0;

  for (const term of queryTerms) {
    // Get IDF from cache, default to 0 if term not in corpus
    const idf = index.idfCache.get(term) || 0;

    // Calculate term frequency in document
    const tf = termFrequency(term, document);

    // BM25 formula
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + (b * docLength) / index.avgDocLength);

    score += idf * (numerator / denominator);
  }

  return score;
};

/**
 * Rank skills by BM25 relevance to a query
 *
 * @param query - User message/query
 * @param skillNames - Array of skill names (must match index order)
 * @param index - Precomputed BM25 index
 * @param config - BM25 configuration
 * @returns Array of [skillName, score] tuples sorted by relevance (descending)
 */
export const rankSkillsByBM25 = (
  query: string,
  skillNames: string[],
  index: BM25Index,
  config: BM25Config = {},
): Array<[string, number]> => {
  const { threshold } = { ...DEFAULT_BM25_CONFIG, ...config };

  const scores: Array<[string, number]> = [];

  for (let i = 0; i < skillNames.length; i++) {
    const score = calculateBM25Score(query, i, index, config);

    // Only include scores above threshold
    if (score >= threshold) {
      scores.push([skillNames[i], score]);
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b[1] - a[1]);

  return scores;
};

/**
 * Get top N skills by BM25 relevance
 *
 * @param query - User message/query
 * @param skillNames - Array of skill names
 * @param index - Precomputed BM25 index
 * @param topN - Number of top results to return
 * @param config - BM25 configuration
 * @returns Array of top N skill names by relevance
 */
export const getTopSkillsByBM25 = (
  query: string,
  skillNames: string[],
  index: BM25Index,
  topN: number = 3,
  config: BM25Config = {},
): string[] => {
  const ranked = rankSkillsByBM25(query, skillNames, index, config);
  return ranked.slice(0, topN).map(([name]) => name);
};
