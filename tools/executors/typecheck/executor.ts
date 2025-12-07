import { ExecutorContext } from '@nx/devkit';

// Try to require nx devkit when available
const tryRequireNx = () => {
  try {
    return require('@nx/devkit');
  } catch (e) {
    return null;
  }
};

export default async function runExecutor(
  options: { tsconfig?: string; watch?: boolean; extraArgs?: string[]; __spawnSync?: any },
  context: ExecutorContext,
) {
  const workspaceRoot = context.root;
  const devkit = tryRequireNx();

  const tsconfig = options.tsconfig ?? 'tsconfig.base.json';
  const watch = !!options.watch;
  const extraArgs = Array.isArray(options.extraArgs) ? options.extraArgs : [];

  // Allow injection for tests
  const spawnSyncImpl =
    options.__spawnSync ??
    ((cmd: string, args: string[], opts: any) => {
      const child = require('child_process');
      return child.spawnSync(cmd, args, opts);
    });

  const args = ['tsc', '--noEmit', '-p', tsconfig, ...extraArgs];

  if (watch) {
    // Start a long-running watch process using spawn so it doesn't block the executor
    console.log(`typecheck executor: starting watch: bunx ${args.join(' ')}`);
    try {
      const child = require('child_process').spawn('bunx', args, { stdio: 'inherit', cwd: workspaceRoot });
      // Return success true to indicate the watcher started. Caller is responsible for lifecycle.
      return { success: true };
    } catch (err) {
      console.error('typecheck executor: failed to start watch', err);
      return { success: false };
    }
  }

  console.log(`typecheck executor: running: bunx ${args.join(' ')}`);
  const res = spawnSyncImpl('bunx', args, { stdio: 'inherit', cwd: workspaceRoot });

  if (res && (res as any).error) {
    console.error('typecheck executor: execution error', (res as any).error);
    return { success: false };
  }

  const code = res ? (res as any).status : 1;
  return { success: code === 0 };
}
