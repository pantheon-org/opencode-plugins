/**
 * Find Matching Skills
 *
 * Batch check multiple skills for pattern matches against content.
 */

import type { SkillsPluginConfig } from '../types';
import { hasIntentToUse } from './has-intent-to-use';

/**
 * Batch check multiple skills for pattern matches
 *
 * @param content - The message content to analyze
 * @param skillNames - Array of skill names to check
 * @param skillKeywords - Map of skill names to additional keywords
 * @param config - Optional configuration for pattern matching
 * @returns Array of skill names that match
 *
 * @example
 * ```typescript
 * const skills = ['typescript-tdd', 'bun-runtime'];
 * const keywords = new Map([
 *   ['typescript-tdd', ['TDD', 'test-driven']],
 *   ['bun-runtime', ['bun', 'runtime']],
 * ]);
 *
 * findMatchingSkills('Use TDD approach', skills, keywords)
 * // => ['typescript-tdd']
 * ```
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
