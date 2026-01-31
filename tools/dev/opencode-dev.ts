#!/usr/bin/env bunx tsx
import type { ChildProcess } from 'node:child_process';
import { parseArgs } from './src/args';
import { createBuildConfig, startBuildWatcher, waitForDist } from './src/build';
import { revertOpencodeJson, updateOpencodeJson } from './src/config';
import { createFileUris } from './src/create-file-uris';
import { createPluginLink, getLatestMtime } from './src/fs';
import { handleReload, setupServerMode, spawnOpencode } from './src/server';
import { setupCleanupHandlers } from './src/setup-cleanup-handlers';
import type { CleanupState } from './src/types';

async function initializePlugins(
  opts: { plugins: string[]; workspaceRoot: string; symlinkRoot: string },
  state: CleanupState,
): Promise<{ links: string[]; distPaths: string[] }> {
  const links: string[] = [];
  const distPaths: string[] = [];

  for (const spec of opts.plugins) {
    const config = createBuildConfig(opts.workspaceRoot, spec);
    const watcher = await startBuildWatcher(config.projectName);
    if (watcher) state.buildProcesses.push(watcher);

    console.log(`Waiting for dist at ${config.distPath}...`);
    const hasDist = await waitForDist(config.distPath);
    if (!hasDist) {
      console.warn('dist not found for', config.projectName, '- will create link when available');
    }

    const linkPath = await createPluginLink(config.distPath, config.projectName, opts.symlinkRoot, opts.workspaceRoot);
    links.push(linkPath);
    distPaths.push(config.distPath);
  }

  return { links, distPaths };
}

async function main(): Promise<void> {
  const opts = parseArgs();
  if (opts.revert) {
    await revertOpencodeJson(opts.workspaceRoot);
    process.exit(0);
  }

  const state: CleanupState = { buildProcesses: [], opProcess: null };
  setupCleanupHandlers(state);

  const { links, distPaths } = await initializePlugins(opts, state);
  const fileUris = createFileUris(links);

  if (opts.apply) {
    await updateOpencodeJson(opts.workspaceRoot, fileUris);
  } else {
    console.log('Apply disabled; add to opencode.json:');
    for (const f of fileUris) console.log('  ', f);
  }

  const { opProcess } = await setupServerMode(opts.disposeUrl, opts.disposeEnabled, opts.workspaceRoot);
  state.opProcess = opProcess;

  const lastMtimes = distPaths.map((dp) => getLatestMtime(dp));
  let restarting = false;

  setInterval(() => {
    void (async () => {
      try {
        for (let i = 0; i < distPaths.length; i++) {
          const dp = distPaths[i];
          const last = lastMtimes[i] ?? 0;
          const now = getLatestMtime(dp);

          if (now > last && !restarting) {
            console.log(`Change detected in ${dp}; handling reload...`);
            lastMtimes[i] = now;
            restarting = true;

            const result = await handleReload(opts.disposeUrl, opts.disposeEnabled, state);
            console.log(result.message);

            if (result.shouldRestart && state.opProcess) {
              try {
                state.opProcess.kill();
              } catch {}
              setTimeout(() => {
                restarting = false;
                state.opProcess = spawnOpencode(opts.workspaceRoot);
              }, 300);
            } else {
              restarting = false;
            }
          }
        }
      } catch (err) {
        console.warn('Watch poll error', String(err));
      }
    })();
  }, 1000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
