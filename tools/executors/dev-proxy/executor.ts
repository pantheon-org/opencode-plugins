import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { type ExecutorContext, runExecutor as nxRunExecutor, type ProjectConfiguration } from '@nx/devkit';

interface DevProxyOptions {
  plugins?: string[];
  symlinkRoot?: string;
  apply?: boolean;
  __runExecutor?: typeof nxRunExecutor;
  __spawnSync?: typeof spawnSync;
}

interface ExecutorResult {
  success: boolean;
}

interface ResolvedProject {
  name: string;
  root?: string;
  config?: ProjectConfiguration;
}

/**
 * Nx executor for running dev proxy with build watchers
 * @param options - Executor options including plugin names and symlink configuration
 * @param context - Nx executor context
 * @returns Executor result indicating success or failure
 */
// eslint-disable-next-line max-statements, complexity
const runExecutor = async (options: DevProxyOptions, context: ExecutorContext): Promise<ExecutorResult> => {
  const workspaceRoot = context.root;

  const requestedPlugins =
    options.plugins && options.plugins.length > 0 ? options.plugins : context.projectName ? [context.projectName] : [];

  if (requestedPlugins.length === 0) {
    console.error('No project specified for dev-proxy (provide --plugins or run from a project context)');
    return { success: false };
  }

  // Resolve projects - simplified to just use the names
  const resolved: ResolvedProject[] = requestedPlugins.map((name) => ({ name }));

  // Start watchers
  const stopFns: Array<() => Promise<void>> = [];

  // Choose runExecutor implementation: allow injection for tests
  const runExecutorImpl = options.__runExecutor ?? nxRunExecutor;
  const spawnSyncImpl = options.__spawnSync ?? spawnSync;

  for (const r of resolved) {
    const projName = r.name;
    let started = false;

    if (runExecutorImpl) {
      try {
        const iterator = await runExecutorImpl(
          { project: projName, target: 'build', configuration: undefined },
          { watch: true },
          context,
        );

        if (iterator && Symbol.asyncIterator in iterator) {
          (async () => {
            try {
              for await (const out of iterator) {
                if (!out || !out.success) console.error(`Build for ${projName} reported failure`);
              }
            } catch (err) {
              console.error(`runExecutor iterator error for ${projName}:`, err);
            }
          })();
          stopFns.push(async () => {
            try {
              if (typeof iterator.return === 'function') await iterator.return();
            } catch {
              // Failed to stop iterator
            }
          });
          started = true;
        }
      } catch (err) {
        console.warn(`runExecutor failed for ${projName}:`, String(err));
      }
    }

    if (!started) {
      try {
        const child = spawn('bunx', ['nx', 'run', `${projName}:build`, '--watch'], {
          stdio: 'inherit',
          cwd: workspaceRoot,
        });
        stopFns.push(async () => {
          try {
            child.kill();
          } catch {
            // Failed to kill process
          }
        });
      } catch (err) {
        console.warn(`Failed to start CLI watcher for ${projName}:`, String(err));
      }
    }
  }

  // Spawn the runtime dev script
  const script = path.join(workspaceRoot, 'tools', 'dev', 'opencode-dev.ts');
  const args: string[] = [];
  if (options.symlinkRoot) args.push('--symlink-root', options.symlinkRoot);
  if (options.apply === false) args.push('--no-apply');
  args.push(...requestedPlugins);

  // Ensure cleanup on SIGINT
  let exiting = false;
  const sigintHandler = async () => {
    if (exiting) return;
    exiting = true;
    for (const fn of stopFns) {
      try {
        await fn();
      } catch {
        // Failed to stop watcher
      }
    }
    process.exit(0);
  };
  process.on('SIGINT', sigintHandler);

  // Run runtime script synchronously
  const res = spawnSyncImpl('bunx', ['tsx', script, ...args], { stdio: 'inherit', cwd: workspaceRoot });

  // Ensure watchers are terminated when runtime exits
  for (const fn of stopFns) {
    try {
      fn();
    } catch {
      // Failed to terminate watcher
    }
  }

  if (res?.error) {
    console.error('Failed to run dev proxy runtime', res.error);
    return { success: false };
  }
  return { success: res?.status === 0 };
};

export default runExecutor;
