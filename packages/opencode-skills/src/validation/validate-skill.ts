/**
 * Validate Skill
 *
 * Comprehensive validation for Skill objects with structured content support.
 */

import type { Skill } from '../types';
import type { ValidationError, ValidationResult, ValidationSuggestion, ValidationWarning } from './types';

/**
 * Validate a skill object
 *
 * Validates required fields, content structure, and provides warnings and suggestions.
 *
 * @param skill - Skill object to validate
 * @param _strict - Reserved for future strict mode (currently unused)
 * @returns ValidationResult with errors, warnings, and suggestions
 *
 * @example
 * ```typescript
 * const skill = {
 *   name: 'typescript-tdd',
 *   description: 'TypeScript with TDD',
 *   whatIDo: 'I help with TypeScript development',
 *   whenToUseMe: 'Use me when starting a new project',
 *   instructions: 'Follow test-first development',
 *   checklist: ['Write tests', 'Implement feature'],
 * };
 *
 * const result = validateSkill(skill);
 * // => { valid: true, errors: [], warnings: [...], suggestions: [...] }
 * ```
 */
export function validateSkill(skill: Skill, _strict?: boolean): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Required field validation
  if (!skill.name) {
    errors.push({ field: 'name', message: 'Name is required', severity: 'error' });
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skill.name)) {
    errors.push({
      field: 'name',
      message: 'Name must be lowercase alphanumeric with hyphens (kebab-case)',
      severity: 'error',
    });
  }

  if (!skill.description) {
    errors.push({ field: 'description', message: 'Description is required', severity: 'error' });
  }

  // Check for structured content (new format)
  const hasStructuredContent = skill.whatIDo || skill.whenToUseMe || skill.instructions || skill.checklist;
  const hasLegacyContent = skill.content;

  if (!hasStructuredContent && !hasLegacyContent) {
    errors.push({
      field: 'content',
      message:
        'Either structured content (whatIDo, whenToUseMe, instructions, checklist) or legacy content field is required',
      severity: 'error',
    });
  }

  if (hasLegacyContent && !hasStructuredContent) {
    warnings.push({
      field: 'content',
      message:
        'Using deprecated "content" field. Consider migrating to structured content (whatIDo, whenToUseMe, instructions, checklist)',
      severity: 'warning',
    });
  }

  // Validate structured content fields
  if (hasStructuredContent) {
    if (!skill.whatIDo) {
      errors.push({ field: 'whatIDo', message: 'whatIDo section is required', severity: 'error' });
    }
    if (!skill.whenToUseMe) {
      errors.push({
        field: 'whenToUseMe',
        message: 'whenToUseMe section is required',
        severity: 'error',
      });
    }
    if (!skill.instructions) {
      errors.push({
        field: 'instructions',
        message: 'instructions section is required',
        severity: 'error',
      });
    }
    if (!skill.checklist || skill.checklist.length === 0) {
      errors.push({
        field: 'checklist',
        message: 'checklist must contain at least one item',
        severity: 'error',
      });
    }
  }

  // Recommended field validation (warnings)
  if (!skill.license) {
    warnings.push({ field: 'license', message: 'License is recommended (e.g., MIT)', severity: 'warning' });
  }

  if (!skill.compatibility) {
    warnings.push({
      field: 'compatibility',
      message: 'Compatibility should be set to "opencode"',
      severity: 'warning',
    });
  }

  if (!skill.metadata?.category) {
    warnings.push({
      field: 'metadata.category',
      message: 'Category is recommended (workflow, development, documentation, etc.)',
      severity: 'warning',
    });
  }

  // Quality suggestions
  if (skill.whatIDo && skill.whatIDo.length < 50) {
    suggestions.push({
      field: 'whatIDo',
      message: 'Consider expanding "What I do" section (current: < 50 chars)',
      severity: 'info',
    });
  }

  if (skill.checklist && skill.checklist.length < 2) {
    suggestions.push({
      field: 'checklist',
      message: 'Consider adding more checklist items (current: < 2 items)',
      severity: 'info',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}
