/**
 * Skill type definitions
 */

/**
 * A skill represents a reusable piece of knowledge or guidance
 * that can be automatically injected into chat context when needed.
 */
export interface Skill {
  /** Unique identifier for the skill (kebab-case) */
  name: string;

  /** Brief description of what the skill provides */
  description: string;

  /** The full skill content in markdown format */
  content: string;

  /** Optional version string for tracking updates */
  version?: string;

  /** Optional last update timestamp */
  updatedAt?: string;

  /** Optional list of skill names this skill depends on */
  dependencies?: string[];

  /** Optional category for organizing skills */
  category?: string;

  /** Optional keywords for enhanced pattern matching */
  keywords?: string[];
}

/**
 * BM25 ranking configuration for relevance scoring
 */
export interface BM25Config {
  /** Enable BM25 relevance scoring (default: false) */
  enabled?: boolean;

  /** Term frequency saturation parameter (default: 1.5, typical range: 1.2-2.0) */
  k1?: number;

  /** Length normalization parameter (default: 0.75, typical range: 0-1) */
  b?: number;

  /** Minimum BM25 score threshold for injection (default: 0.0) */
  threshold?: number;

  /** Maximum number of skills to inject per message (default: 3) */
  maxSkills?: number;
}

/**
 * Configuration options for the skills plugin
 */
export interface SkillsPluginConfig {
  /** Enable/disable auto-injection via chat hook */
  autoInject?: boolean;

  /** Enable/disable debug logging */
  debug?: boolean;

  /** Custom pattern matching configuration */
  patternMatching?: {
    /** Enable word boundary matching (default: true) */
    wordBoundary?: boolean;

    /** Enable intent detection patterns (default: true) */
    intentDetection?: boolean;

    /** Enable negation detection (default: true) */
    negationDetection?: boolean;

    /** Custom intent keywords (in addition to defaults) */
    customIntentKeywords?: string[];

    /** Custom negation keywords (in addition to defaults) */
    customNegationKeywords?: string[];
  };

  /** BM25 relevance scoring configuration */
  bm25?: BM25Config;
}

/**
 * Result of pattern matching for a skill
 */
export interface MatchResult {
  /** Whether the skill matches the content */
  matches: boolean;

  /** The specific pattern that matched (for debugging) */
  matchedPattern?: string;

  /** Whether negation was detected */
  hasNegation: boolean;
}
