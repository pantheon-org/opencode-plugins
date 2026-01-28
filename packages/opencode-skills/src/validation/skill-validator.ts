import type { Skill } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

export interface ValidationSuggestion {
  field: string;
  message: string;
  severity: 'info';
}

export const validateSkill = (skill: Skill, strict?: boolean): ValidationResult => {
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
};

export const formatValidationResult = (result: ValidationResult, skillName: string): string => {
  let output = `\n📋 Validation Results for "${skillName}"\n`;
  output += `${'='.repeat(50)}\n\n`;

  if (result.errors.length > 0) {
    output += `❌ Errors (${result.errors.length}):\n`;
    result.errors.forEach((e) => {
      output += `  • ${e.field}: ${e.message}\n`;
    });
    output += '\n';
  }

  if (result.warnings.length > 0) {
    output += `⚠️  Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach((w) => {
      output += `  • ${w.field}: ${w.message}\n`;
    });
    output += '\n';
  }

  if (result.suggestions.length > 0) {
    output += `💡 Suggestions (${result.suggestions.length}):\n`;
    result.suggestions.forEach((s) => {
      output += `  • ${s.field}: ${s.message}\n`;
    });
    output += '\n';
  }

  if (result.valid) {
    output += '✅ Skill is valid!\n';
  } else {
    output += '❌ Skill validation failed. Please fix errors above.\n';
  }

  return output;
};
