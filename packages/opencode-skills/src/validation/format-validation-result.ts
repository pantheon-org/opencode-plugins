import type { ValidationResult } from '../types.js';

export const formatValidationResult = (result: ValidationResult, skillName: string): string => {
  const lines: string[] = [];

  lines.push(`Validation Results for "${skillName}"`);
  lines.push('');

  if (!result.valid) {
    lines.push('❌ Errors:');
    for (const error of result.errors) {
      lines.push(`  - ${error.field}: ${error.message}`);
    }
    lines.push('');
    lines.push('Skill validation failed');
  } else {
    if (result.warnings.length > 0) {
      lines.push('⚠️  Warnings:');
      for (const warning of result.warnings) {
        lines.push(`  - ${warning.field}: ${warning.message}`);
      }
      lines.push('');
    }

    if (result.suggestions.length > 0) {
      lines.push('💡 Suggestions:');
      for (const suggestion of result.suggestions) {
        lines.push(`  - ${suggestion.field}: ${suggestion.message}`);
      }
      lines.push('');
    }

    if (result.warnings.length === 0 && result.suggestions.length === 0) {
      lines.push('✅ Skill is valid');
    } else {
      lines.push('✅ Skill is valid (with warnings/suggestions)');
    }
  }

  return lines.join('\n');
};
