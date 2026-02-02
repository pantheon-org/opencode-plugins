/**
 * Validation Type Definitions
 *
 * Type definitions for skill validation results and errors.
 */

/**
 * Validation result with errors, warnings, and suggestions
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

/**
 * Validation error (blocking)
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

/**
 * Validation warning (non-blocking)
 */
export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

/**
 * Validation suggestion (informational)
 */
export interface ValidationSuggestion {
  field: string;
  message: string;
  severity: 'info';
}
