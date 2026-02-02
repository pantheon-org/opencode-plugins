/**
 * Smart Pattern Matching for Skill Detection
 *
 * This module provides intelligent pattern matching for detecting user intent
 * to use specific skills in their messages. It uses multiple strategies including:
 *
 * - Word boundary matching for exact skill names
 * - Intent detection with configurable keywords
 * - Negation detection to avoid false positives
 * - Custom keyword matching for aliases
 *
 * @see https://github.com/pantheon-org/opencode-skills
 */

export { escapeRegex } from './escape-regex';
export { findMatchingSkills } from './find-matching-skills';
export { hasIntentToUse } from './has-intent-to-use';
