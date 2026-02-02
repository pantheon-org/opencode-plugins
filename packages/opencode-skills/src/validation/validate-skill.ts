import type { Skill, ValidationError, ValidationResult, ValidationSuggestion, ValidationWarning } from '../types.js';

export const validateSkill = (skill: Skill, _strictMode = false): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Validate name
  if (!skill.name || skill.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Name is required',
      code: 'MISSING_NAME',
    });
  } else if (!/^[a-z0-9-]+$/.test(skill.name)) {
    errors.push({
      field: 'name',
      message: 'Name must be in kebab-case format (lowercase letters, numbers, and hyphens only)',
      code: 'INVALID_NAME_FORMAT',
    });
  }

  // Validate description
  if (!skill.description || skill.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Description is required',
      code: 'MISSING_DESCRIPTION',
    });
  } else if (skill.description.length < 10) {
    warnings.push({
      field: 'description',
      message: 'Description should be at least 10 characters',
      code: 'SHORT_DESCRIPTION',
    });
  }

  // Check for legacy content field (v1 format)
  const hasLegacyContent = skill.content && skill.content.trim() !== '';

  // If using legacy content, warn about deprecation but don't require v2 fields
  if (hasLegacyContent) {
    warnings.push({
      field: 'content',
      message: 'content field is deprecated. Use whatIDo, whenToUseMe, instructions, checklist instead',
      code: 'DEPRECATED_CONTENT',
    });
  }

  // Validate v2 structured content fields (required only if not using legacy content)
  if (!hasLegacyContent) {
    // Validate whatIDo (required in v2)
    if (!skill.whatIDo || skill.whatIDo.trim() === '') {
      errors.push({
        field: 'whatIDo',
        message: 'whatIDo is required (Core capabilities section)',
        code: 'MISSING_WHAT_I_DO',
      });
    } else if (skill.whatIDo.length < 20) {
      suggestions.push({
        field: 'whatIDo',
        message: 'Consider expanding whatIDo to be more descriptive (at least 20 characters)',
      });
    }

    // Validate whenToUseMe (required in v2)
    if (!skill.whenToUseMe || skill.whenToUseMe.trim() === '') {
      errors.push({
        field: 'whenToUseMe',
        message: 'whenToUseMe is required (When to use me section)',
        code: 'MISSING_WHEN_TO_USE',
      });
    }

    // Validate instructions (required in v2)
    if (!skill.instructions || skill.instructions.trim() === '') {
      errors.push({
        field: 'instructions',
        message: 'instructions is required (Instructions section)',
        code: 'MISSING_INSTRUCTIONS',
      });
    }

    // Validate checklist (required in v2)
    if (!skill.checklist || skill.checklist.length === 0) {
      errors.push({
        field: 'checklist',
        message: 'checklist is required with at least one item',
        code: 'MISSING_CHECKLIST',
      });
    } else if (skill.checklist.length === 1) {
      suggestions.push({
        field: 'checklist',
        message: 'Consider adding more checklist items for better verification',
      });
    }
  }

  // Validate license (required in v2)
  if (!skill.license || skill.license.trim() === '') {
    warnings.push({
      field: 'license',
      message: 'license is recommended (e.g., MIT)',
      code: 'MISSING_LICENSE',
    });
  }

  // Validate compatibility (required in v2)
  if (!skill.compatibility || skill.compatibility.trim() === '') {
    warnings.push({
      field: 'compatibility',
      message: 'compatibility is recommended (e.g., opencode)',
      code: 'MISSING_COMPATIBILITY',
    });
  }

  // Validate metadata.category
  if (!skill.metadata?.category || skill.metadata.category.trim() === '') {
    warnings.push({
      field: 'metadata.category',
      message: 'metadata.category is recommended',
      code: 'MISSING_CATEGORY',
    });
  }

  // Note: strictMode parameter kept for API compatibility
  // Currently doesn't change validation behavior

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
};
