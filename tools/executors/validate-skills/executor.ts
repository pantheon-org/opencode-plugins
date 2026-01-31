import type { ExecutorContext } from '@nx/devkit';
import type { Skill, ValidationResult } from '../../../packages/opencode-skills/src/types';
import {
  formatValidationResult,
  validateSkill,
} from '../../../packages/opencode-skills/src/validation/skill-validator';

export interface ValidateSkillsExecutorOptions {
  skillsPath: string;
  strict: boolean;
  format: 'text' | 'json';
}

export default async (
  options: ValidateSkillsExecutorOptions,
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
    const skillsPath = `${context.root}/${projectRoot}/${options.skillsPath}`;

    // Dynamically import skills
    const skillsModule = await import(skillsPath);
    const skills: Record<string, Skill> = skillsModule.default || skillsModule;

    const results = new Map<string, ValidationResult>();
    let totalSkills = 0;
    let valid = 0;
    let withErrors = 0;
    let withWarnings = 0;

    // Validate each skill
    for (const [_exportName, skill] of Object.entries(skills)) {
      if (typeof skill === 'object' && skill.name) {
        totalSkills++;
        const result = validateSkill(skill, options.strict);
        results.set(skill.name, result);

        if (result.valid) {
          valid++;
        }
        if (result.errors.length > 0) {
          withErrors++;
        }
        if (result.warnings.length > 0) {
          withWarnings++;
        }

        // Output individual results
        if (options.format === 'text') {
          console.log(formatValidationResult(result, skill.name));
        }
      }
    }

    // Summary
    if (options.format === 'text') {
      console.log(`\n${'='.repeat(50)}`);
      console.log('📊 Validation Summary');
      console.log('='.repeat(50));
      console.log(`Total skills: ${totalSkills}`);
      console.log(`✅ Valid: ${valid}`);
      console.log(`❌ With errors: ${withErrors}`);
      console.log(`⚠️  With warnings: ${withWarnings}`);
    } else {
      console.log(JSON.stringify({ totalSkills, valid, withErrors, withWarnings }, null, 2));
    }

    // Fail if errors found (or warnings in strict mode)
    const shouldFail = withErrors > 0 || (options.strict && withWarnings > 0);

    return { success: !shouldFail };
  } catch (error) {
    return {
      success: false,
      error: `Failed to validate skills: ${(error as Error).message}`,
    };
  }
};
