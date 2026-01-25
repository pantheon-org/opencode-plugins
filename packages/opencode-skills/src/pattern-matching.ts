/**
 * Smart pattern matching for skill name detection in user messages
 */

import type { MatchResult, SkillsPluginConfig } from './types';

/**
 * Default intent keywords that signal user wants to use a skill
 */
const DEFAULT_INTENT_KEYWORDS = ['use', 'apply', 'follow', 'implement', 'load', 'get', 'show', 'with'];

/**
 * Default negation keywords that signal user wants to avoid a skill
 */
const DEFAULT_NEGATION_KEYWORDS = ["don't", 'do not', 'avoid', 'skip', 'ignore', 'without', 'except', 'excluding'];

/**
 * Escape special regex characters in a string
 */
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Check if content has intent to use a skill based on pattern matching
 *
 * This function uses multiple strategies to detect if a user message
 * indicates they want to use a particular skill:
 *
 * 1. Word boundary matching - exact skill name with word boundaries
 * 2. Intent detection - skill name preceded/followed by intent keywords
 * 3. Negation detection - rejects matches with negation keywords
 * 4. Keyword matching - optional custom keywords for enhanced detection
 *
 * @param content - The message content to analyze
 * @param skillName - The name of the skill to match
 * @param keywords - Optional additional keywords to match
 * @param config - Optional configuration for pattern matching
 * @returns MatchResult indicating if skill should be injected
 */
export const hasIntentToUse = (
  content: string,
  skillName: string,
  keywords: string[] = [],
  config?: SkillsPluginConfig['patternMatching'],
  // eslint-disable-next-line complexity
): MatchResult => {
  // Normalize content for matching
  const normalizedContent = content.toLowerCase();
  const normalizedSkillName = skillName.toLowerCase();
  const escapedSkillName = escapeRegex(normalizedSkillName);

  // Default config values
  const wordBoundary = config?.wordBoundary ?? true;
  const intentDetection = config?.intentDetection ?? true;
  const negationDetection = config?.negationDetection ?? true;

  const patterns: Array<{ regex: RegExp; description: string }> = [];

  // Pattern 1: Word boundary match (exact skill name)
  if (wordBoundary) {
    patterns.push({
      regex: new RegExp(`\\b${escapedSkillName}\\b`, 'i'),
      description: 'word-boundary',
    });
  }

  // Pattern 2: Intent detection patterns
  if (intentDetection) {
    const intentKeywords = [...DEFAULT_INTENT_KEYWORDS, ...(config?.customIntentKeywords || [])];

    for (const keyword of intentKeywords) {
      // Intent keyword before skill name: "use typescript-tdd"
      patterns.push({
        regex: new RegExp(`\\b${keyword}\\b.*\\b${escapedSkillName}\\b`, 'i'),
        description: `intent-before:${keyword}`,
      });

      // Intent keyword after skill name: "typescript-tdd approach"
      patterns.push({
        regex: new RegExp(`\\b${escapedSkillName}\\b.{0,20}\\b${keyword}\\b`, 'i'),
        description: `intent-after:${keyword}`,
      });
    }
  }

  // Pattern 3: Match additional keywords if provided
  for (const keyword of keywords) {
    const escapedKeyword = escapeRegex(keyword.toLowerCase());
    patterns.push({
      regex: new RegExp(`\\b${escapedKeyword}\\b`, 'i'),
      description: `keyword:${keyword}`,
    });
  }

  // Check if any pattern matches
  let matchedPattern: string | undefined;
  const matches = patterns.some((pattern) => {
    if (pattern.regex.test(normalizedContent)) {
      matchedPattern = pattern.description;
      return true;
    }
    return false;
  });

  // If no match, return early
  if (!matches) {
    return { matches: false, hasNegation: false };
  }

  // Check for negation (if enabled)
  let hasNegation = false;
  if (negationDetection) {
    const negationKeywords = [...DEFAULT_NEGATION_KEYWORDS, ...(config?.customNegationKeywords || [])];

    hasNegation = negationKeywords.some((negWord) => {
      // Check if negation appears before skill name
      const negPattern = new RegExp(`\\b${escapeRegex(negWord)}\\b.{0,50}\\b${escapedSkillName}\\b`, 'i');
      return negPattern.test(normalizedContent);
    });
  }

  return {
    matches: matches && !hasNegation,
    matchedPattern,
    hasNegation,
  };
};

/**
 * Batch check multiple skills for pattern matches
 *
 * @param content - The message content to analyze
 * @param skillNames - Array of skill names to check
 * @param skillKeywords - Map of skill names to additional keywords
 * @param config - Optional configuration for pattern matching
 * @returns Array of skill names that match
 */
export const findMatchingSkills = (
  content: string,
  skillNames: string[],
  skillKeywords: Map<string, string[]> = new Map(),
  config?: SkillsPluginConfig['patternMatching'],
): string[] => {
  const matchingSkills: string[] = [];

  for (const skillName of skillNames) {
    const keywords = skillKeywords.get(skillName) || [];
    const result = hasIntentToUse(content, skillName, keywords, config);

    if (result.matches) {
      matchingSkills.push(skillName);
    }
  }

  return matchingSkills;
};
