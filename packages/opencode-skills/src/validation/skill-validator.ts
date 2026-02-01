import type {
  Skill,
  SkillDefinition,
  SkillMetadata,
  SkillRegistry,
  SkillValidator,
  ValidationContext,
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from '../types.js';

// Re-export types for backward compatibility
export type {
  SkillMetadata,
  SkillDefinition,
  Skill,
  SkillRegistry,
  SkillValidator,
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
  ValidationContext,
};

export function createSkillRegistry(): SkillRegistry {
  const skills = new Map<string, Skill>();

  return {
    register(skill: Skill): void {
      skills.set(skill.name, skill);
    },

    get(name: string): Skill | undefined {
      return skills.get(name);
    },

    has(name: string): boolean {
      return skills.has(name);
    },

    list(): Skill[] {
      return Array.from(skills.values());
    },

    clear(): void {
      skills.clear();
    },

    size(): number {
      return skills.size;
    },
  };
}

export function createDefaultValidator(): SkillValidator {
  return {
    validate(skill: SkillDefinition): ValidationResult {
      const issues: ValidationIssue[] = [];

      // Validate name
      if (!skill.name || skill.name.trim() === '') {
        issues.push({
          code: 'MISSING_NAME',
          message: 'Skill name is required',
          severity: 'error',
          path: 'name',
        });
      } else if (!/^[a-z0-9-]+$/.test(skill.name)) {
        issues.push({
          code: 'INVALID_NAME_FORMAT',
          message: 'Skill name must contain only lowercase letters, numbers, and hyphens',
          severity: 'error',
          path: 'name',
        });
      }

      // Validate description
      if (!skill.description || skill.description.trim() === '') {
        issues.push({
          code: 'MISSING_DESCRIPTION',
          message: 'Skill description is required',
          severity: 'error',
          path: 'description',
        });
      } else if (skill.description.length < 10) {
        issues.push({
          code: 'DESCRIPTION_TOO_SHORT',
          message: 'Skill description should be at least 10 characters',
          severity: 'warning',
          path: 'description',
        });
      }

      // Validate keywords
      if (!skill.keywords || skill.keywords.length === 0) {
        issues.push({
          code: 'MISSING_KEYWORDS',
          message: 'At least one keyword is recommended',
          severity: 'warning',
          path: 'keywords',
        });
      }

      // Validate content sections if present
      if (skill.contentSections) {
        for (const [index, section] of skill.contentSections.entries()) {
          if (!section.type || section.type.trim() === '') {
            issues.push({
              code: 'MISSING_SECTION_TYPE',
              message: `Content section ${index + 1} is missing type`,
              severity: 'error',
              path: `contentSections[${index}].type`,
            });
          }

          if (!section.content || section.content.trim() === '') {
            issues.push({
              code: 'MISSING_SECTION_CONTENT',
              message: `Content section ${index + 1} is missing content`,
              severity: 'error',
              path: `contentSections[${index}].content`,
            });
          }
        }
      }

      // Validate examples if present
      if (skill.examples) {
        for (const [index, example] of skill.examples.entries()) {
          if (!example.description || example.description.trim() === '') {
            issues.push({
              code: 'MISSING_EXAMPLE_DESCRIPTION',
              message: `Example ${index + 1} is missing description`,
              severity: 'warning',
              path: `examples[${index}].description`,
            });
          }
        }
      }

      // Validate metadata if present
      if (skill.metadata) {
        if (skill.metadata.category && skill.metadata.category.trim() === '') {
          issues.push({
            code: 'EMPTY_CATEGORY',
            message: 'Category should not be empty if provided',
            severity: 'warning',
            path: 'metadata.category',
          });
        }

        if (skill.metadata.author && skill.metadata.author.trim() === '') {
          issues.push({
            code: 'EMPTY_AUTHOR',
            message: 'Author should not be empty if provided',
            severity: 'warning',
            path: 'metadata.author',
          });
        }
      }

      return {
        valid: !issues.some((issue) => issue.severity === 'error'),
        issues,
      };
    },
  };
}

export function validateSkillDefinition(skill: SkillDefinition): ValidationResult {
  const validator = createDefaultValidator();
  return validator.validate(skill);
}

export function formatValidationIssues(issues: ValidationIssue[]): string {
  return issues
    .map(
      (issue) =>
        `[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}${issue.path ? ` (at ${issue.path})` : ''}`,
    )
    .join('\n');
}

export function hasValidationErrors(result: ValidationResult): boolean {
  return result.issues.some((issue) => issue.severity === 'error');
}

export function hasValidationWarnings(result: ValidationResult): boolean {
  return result.issues.some((issue) => issue.severity === 'warning');
}

export function getValidationErrors(result: ValidationResult): ValidationIssue[] {
  return result.issues.filter((issue) => issue.severity === 'error');
}

export function getValidationWarnings(result: ValidationResult): ValidationIssue[] {
  return result.issues.filter((issue) => issue.severity === 'warning');
}
