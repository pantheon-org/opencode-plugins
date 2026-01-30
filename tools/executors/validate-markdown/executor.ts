import { join } from 'node:path';
import type { ExecutorContext } from '@nx/devkit';
import { $ } from 'bun';
import type { ValidateMarkdownExecutorSchema } from './schema';

/**
 * Validates markdown files using markdownlint-cli2
 */
export const validateMarkdownExecutor = async (
  options: ValidateMarkdownExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> => {
  const projectRoot = context.projectGraph?.nodes[context.projectName!]?.data.root;
  if (!projectRoot) {
    console.error('❌ Project root not found');
    return { success: false };
  }

  const workspaceRoot = context.root;
  const absoluteProjectRoot = join(workspaceRoot, projectRoot);

  const patterns = options.patterns || ['**/*.md'];
  const config = options.config || '.markdownlint.jsonc';
  const fixFlag = options.fix ? '--fix' : '';

  try {
    const _result = await $`bunx markdownlint-cli2 ${fixFlag} --config ${config} ${patterns.join(' ')}`
      .cwd(absoluteProjectRoot)
      .quiet();
    return { success: true };
  } catch (_error) {
    console.error('❌ Markdown validation failed');
    return { success: false };
  }
};

export default validateMarkdownExecutor;
