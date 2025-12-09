import { spawn, spawnSync } from 'node:child_process';

import { ExecutorContext } from '@nx/devkit';

interface ExecutorOptions {
  tsconfig?: string;
  watch?: boolean;
  extraArgs?: string[];
  __spawnSync?: typeof spawnSync;
}

interface ExecutorResult {
  success: boolean;
}

/**
 * Nx executor for running TypeScript type checking
 * @param options - Executor options including tsconfig path and watch mode
 * @param context - Nx executor context
 * @returns Executor result indicating success or failure
 */
const runExecutor = async (options: ExecutorOptions, context: ExecutorContext): Promise<ExecutorResult> => {
  const workspaceRoot = context.root;

  const tsconfig = options.tsconfig ?? 'tsconfig.base.json';
  const watch = !!options.watch;
  const extraArgs = Array.isArray(options.extraArgs) ? options.extraArgs : [];

  // Allow injection for tests
  const spawnSyncImpl = options.__spawnSync ?? spawnSync;

  const args = ['tsc', '--noEmit', '-p', tsconfig, ...extraArgs];

  if (watch) {
    // Start a long-running watch process using spawn so it doesn't block the executor
    console.log(`typecheck executor: starting watch: bunx ${args.join(' ')}`);
    try {
      spawn('bunx', args, { stdio: 'inherit', cwd: workspaceRoot });
      // Return success true to indicate the watcher started. Caller is responsible for lifecycle.
      return { success: true };
    } catch (err) {
      console.error('typecheck executor: failed to start watch', err);
      return { success: false };
    }
  }

  console.log(`typecheck executor: running: bunx ${args.join(' ')}`);
  const res = spawnSyncImpl('bunx', args, { stdio: 'inherit', cwd: workspaceRoot });

  if (res?.error) {
    console.error('typecheck executor: execution error', res.error);
    return { success: false };
  }

  const code = res?.status ?? 1;
  return { success: code === 0 };
};

export default runExecutor;
