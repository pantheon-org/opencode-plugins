/**
 * Format Validation Result
 *
 * Format validation results for human-readable console output.
 */

import type { ValidationResult } from './types';

/**
 * Format validation result for console output
 *
 * @param result - Validation result to format
 * @param skillName - Name of the skill being validated
 * @returns Formatted string with errors, warnings, and suggestions
 *
 * @example
 * ```typescript
 * const result = {
 *   valid: false,
 *   errors: [{ field: 'name', message: 'Name is required', severity: 'error' }],
 *   warnings: [],
 *   suggestions: [],
 * };
 *
 * console.log(formatValidationResult(result, 'my-skill'));
 * // Outputs:
 * // 📋 Validation Results for "my-skill"
 * // ==================================================
 * //
 * // ❌ Errors (1):
 * //   • name: Name is required
 * // ...
 * ```
 */
export function formatValidationResult(result: ValidationResult, skillName: string): string {
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
}
