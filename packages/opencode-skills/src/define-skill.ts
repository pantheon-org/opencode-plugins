/**
 * Define Skill Helper
 *
 * Helper function to create skill objects with validation and structured content migration.
 */

import type { Skill } from './types';
import { formatValidationResult, validateSkill } from './validation/index';

/**
 * Helper function to create a skill object with validation
 *
 * @param skill - Partial skill object (name and description required)
 * @param options - Optional validation options
 * @returns Complete Skill object
 *
 * @example
 * ```typescript
 * const mySkill = defineSkill({
 *   name: 'typescript-tdd',
 *   description: 'TypeScript development with TDD',
 *   whatIDo: 'I help you write TypeScript with TDD practices',
 *   whenToUseMe: 'Use me when starting a new TypeScript project',
 *   instructions: 'Follow test-first development',
 * });
 * ```
 */
export const defineSkill = (
  skill: Pick<Skill, 'name' | 'description'> & Partial<Omit<Skill, 'name' | 'description'>>,
  options?: { strict?: boolean; validate?: boolean },
): Skill => {
  const fullSkill: Skill = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    ...skill,
  };

  // Migrate legacy content to structured format if present
  if (fullSkill.content && !fullSkill.whatIDo) {
    console.warn(
      `[opencode-skills] Skill "${skill.name}" uses deprecated "content" field. Consider migrating to structured content.`,
    );
  }

  // Validate if requested (default: true in dev, false in prod)
  const shouldValidate = options?.validate ?? process.env.NODE_ENV !== 'production';

  if (shouldValidate) {
    const result = validateSkill(fullSkill, options?.strict);

    // Log formatted results
    if (
      result.errors.length > 0 ||
      result.warnings.length > 0 ||
      (process.env.DEBUG && result.suggestions.length > 0)
    ) {
      console.log(formatValidationResult(result, skill.name));
    }

    // Throw in strict mode
    if (options?.strict && !result.valid) {
      throw new Error(`Skill "${skill.name}" has validation errors. See output above.`);
    }
  }

  return fullSkill;
};
