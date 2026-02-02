import { readFile } from 'node:fs/promises';
import type { ExecutorContext } from '@nx/devkit';
import { glob } from 'glob';
import {
  markdownToSkill,
  formatValidationResult,
  validateSkill,
} from '@pantheon-org/opencode-skills';

export interface ValidateSkillMdExecutorOptions {
  pattern: string;
  strict: boolean;
  format: 'text' | 'json';
}

export default async (
  options: ValidateSkillMdExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const projectName = context.projectName;
    if (!projectName) {
      return { success: false, error: 'No project name in context' };
    }

    const projectConfig = context.projectGraph?.nodes[projectName];
    if (!projectConfig) {
      return { success: false, error: 'Project configuration not found' };
    }

    const projectRoot = projectConfig.data.root;
    const searchPattern = `${context.root}/${projectRoot}/${options.pattern}`;

    // Find all SKILL.md files
    const files = await glob(searchPattern);

    if (files.length === 0) {
      console.log(`✅ No SKILL.md files found matching pattern: ${options.pattern}`);
      return { success: true };
    }

    let totalFiles = 0;
    let valid = 0;
    let withErrors = 0;
    let withWarnings = 0;

    // Validate each file
    for (const filePath of files) {
      totalFiles++;
      const markdown = await readFile(filePath, 'utf-8');

      try {
        const skill = markdownToSkill(markdown);
        const result = validateSkill(skill, options.strict);

        if (result.valid) {
          valid++;
        }
        if (result.errors.length > 0) {
          withErrors++;
        }
        if (result.warnings.length > 0) {
          withWarnings++;
        }

        // Output results
        if (options.format === 'text') {
          console.log(`\n📄 File: ${filePath}`);
          console.log(formatValidationResult(result, skill.name));
        }
      } catch (parseError) {
        withErrors++;
        console.error(`\n❌ Failed to parse ${filePath}:`);
        console.error(`   ${(parseError as Error).message}`);
      }
    }

    // Summary
    if (options.format === 'text') {
      console.log(`\n${'='.repeat(50)}`);
      console.log('📊 Validation Summary');
      console.log('='.repeat(50));
      console.log(`Total files: ${totalFiles}`);
      console.log(`✅ Valid: ${valid}`);
      console.log(`❌ With errors: ${withErrors}`);
      console.log(`⚠️  With warnings: ${withWarnings}`);
    }

    const shouldFail = withErrors > 0 || (options.strict && withWarnings > 0);

    if (shouldFail) {
      const errors = withErrors > 0 ? `${withErrors} file(s) with errors` : '';
      const warnings = withWarnings > 0 && options.strict ? `${withWarnings} file(s) with warnings (strict mode)` : '';
      const reason = [errors, warnings].filter(Boolean).join(', ');
      return {
        success: false,
        error: `SKILL.md validation failed: ${reason}. Run with --verbose for details.`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to validate SKILL.md files: ${(error as Error).message}`,
    };
  }
};
