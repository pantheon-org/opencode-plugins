/**
 * opencode-skills - TypeScript-based skill injection plugin for OpenCode
 *
 * This plugin provides automatic skill injection into chat context using smart
 * pattern matching. Skills are TypeScript-defined knowledge blocks that are
 * seamlessly injected when the user mentions them with intent.
 *
 * Key Features:
 * - Type-safe skill definitions
 * - Smart pattern matching with intent detection
 * - Automatic injection via chat.message hook
 * - No file system side effects
 * - Configurable pattern matching behavior
 *
 * @see https://github.com/pantheon-org/opencode-skills
 */

// BM25 utilities
export { type BM25Index, buildBM25Index, calculateBM25Score, getTopSkillsByBM25, rankSkillsByBM25 } from './bm25/index';
// Main exports
export { createSkillsPlugin } from './create-skills-plugin';
export { defineSkill } from './define-skill';
// Markdown parser utilities
export {
  markdownToSkill,
  type ParsedSkill,
  parseSkillMarkdown,
  type SkillFrontmatter,
  type SkillSections,
  skillToMarkdown,
} from './parsers/index';
// Pattern matching utilities
export { findMatchingSkills, hasIntentToUse } from './pattern-matching/index';
// Type definitions
export type { BM25Config, MatchResult, Skill, SkillMetadata, SkillsPluginConfig } from './types';
// Validation utilities
export {
  formatValidationResult,
  type ValidationError,
  type ValidationResult,
  type ValidationSuggestion,
  type ValidationWarning,
  validateSkill,
} from './validation/index';
