/**
 * Skill type definitions
 */

/**
 * Metadata for a skill
 */
export interface SkillMetadata {
  /** Skill category (workflow, development, documentation, testing, deployment, security) */
  category: string;
  /** Additional metadata fields */
  [key: string]: string;
}

/**
 * A skill represents a reusable piece of knowledge or guidance
 * that can be automatically injected into chat context when needed.
 */
export interface Skill {
  /** Unique identifier for the skill (kebab-case) */
  name: string;

  /** Brief description of what the skill provides */
  description: string;

  /** Core capabilities (What I do section) - required in v2 */
  whatIDo?: string;

  /** Conditions that should trigger this skill (When to use me section) - required in v2 */
  whenToUseMe?: string;

  /** Detailed guidance (Instructions section) - required in v2 */
  instructions?: string;

  /** Verification items (Checklist section) - required in v2 */
  checklist?: string[];

  /** License identifier (e.g., MIT) - required in v2 */
  license?: string;

  /** Compatibility identifier (e.g., opencode) - required in v2 */
  compatibility?: string;

  /** Structured metadata including category - required in v2 */
  metadata?: SkillMetadata;

  /** Optional version string for tracking updates */
  version?: string;

  /** Optional last update timestamp */
  updatedAt?: string;

  /** Optional list of skill names this skill depends on */
  dependencies?: string[];

  /** Optional keywords for enhanced pattern matching */
  keywords?: string[];

  /** @deprecated Use whatIDo, whenToUseMe, instructions, checklist instead */
  content?: string;

  /** @deprecated Use metadata.category instead */
  category?: string;

  /** Content sections for structured skill content */
  contentSections?: Array<{
    type: string;
    content: string;
  }>;

  /** Usage examples for the skill */
  examples?: Array<{
    description: string;
    context?: string;
  }>;
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

// SkillDefinition is an alias for Skill for backward compatibility
export type SkillDefinition = Skill;

// Validation Types
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface ValidationContext {
  packageName?: string;
  filePath?: string;
  strict?: boolean;
}

export interface SkillValidator {
  validate(skill: Skill): ValidationResult;
}

export interface SkillRegistry {
  register(skill: Skill): void;
  get(name: string): Skill | undefined;
  has(name: string): boolean;
  list(): Skill[];
  clear(): void;
  size(): number;
}
