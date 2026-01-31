#!/usr/bin/env bunx tsx
import { type ChildProcess, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { applyEdits, modify as modifyJsonC, parse as parseJsonC } from 'jsonc-parser';

type Opts = {
  plugins: string[];
  symlinkRoot: string;
  apply: boolean;
  revert: boolean;
  workspaceRoot: string;
  disposeEnabled: boolean;
  disposeUrl: string;
};

function printHelp(): never {
  console.log(
    'usage: opencode-dev [--no-apply] [--symlink-root <dir>] [--revert] [--no-dispose] [--dispose-url <url>] <plugin...>',
  );
  console.log('  --no-apply   do not modify opencode.json (print entries instead)');
  console.log('  --revert     restore opencode.json from the last opencode-dev backup and exit');
  console.log('  --no-dispose disable POST /instance/dispose calls');
  console.log('  --dispose-url set custom dispose URL');
  process.exit(0);
}

function parseFlag(argv: string[], index: number, opts: Partial<Opts>): { newIndex: number; updated: boolean } {
  const a = argv[index];

  if (a === '--no-apply') {
    opts.apply = false;
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--symlink-root' && argv[index + 1]) {
    opts.symlinkRoot = argv[++index];
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--revert') {
    opts.revert = true;
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--no-dispose') {
    opts.disposeEnabled = false;
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--dispose-url' && argv[index + 1]) {
    opts.disposeUrl = argv[++index];
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--help' || a === '-h') {
    printHelp();
  }

  return { newIndex: index + 1, updated: false };
}

function createDefaultOpts(): Opts {
  return {
    plugins: [],
    symlinkRoot: '.opencode/plugin',
    apply: true,
    revert: false,
    workspaceRoot: process.cwd(),
    disposeEnabled: true,
    disposeUrl: 'http://localhost:4096/instance/dispose',
  };
}

function validatePlugins(opts: Opts): void {
  if (opts.plugins.length === 0) {
    console.error('Error: at least one plugin must be provided');
    process.exit(1);
  }
}

function parseArgs(): Opts {
  const argv = process.argv.slice(2);
  const opts = createDefaultOpts();

  for (let i = 0; i < argv.length; ) {
    const { newIndex, updated } = parseFlag(argv, i, opts);
    i = newIndex;
    if (!updated) {
      opts.plugins.push(argv[i - 1]);
    }
  }

  if (opts.revert) {
    return {
      plugins: [],
      symlinkRoot: opts.symlinkRoot,
      apply: false,
      revert: true,
      workspaceRoot: opts.workspaceRoot,
      disposeEnabled: opts.disposeEnabled,
      disposeUrl: opts.disposeUrl,
    };
  }

  validatePlugins(opts);
  return opts;
}

function isDir(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function resolvePluginDir(workspaceRoot: string, spec: string): string | null {
  const asPath = path.resolve(workspaceRoot, spec);
  if (isDir(asPath)) return asPath;
  const candidate1 = path.join(workspaceRoot, 'packages', spec);
  if (isDir(candidate1)) return candidate1;
  const candidate2 = path.join(workspaceRoot, 'packages', `opencode-${spec}`);
  if (isDir(candidate2)) return candidate2;
  return null;
}

async function ensureDir(dir: string): Promise<void> {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function removeExistingLink(linkPath: string): Promise<void> {
  try {
    await fs.promises.lstat(linkPath);
    await fs.promises.rm(linkPath, { recursive: true });
  } catch {}
}

async function copyDir(src: string, dest: string): Promise<void> {
  await ensureDir(dest);
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(srcPath, destPath);
    else await fs.promises.copyFile(srcPath, destPath);
  }
}

async function createSymlink(target: string, linkPath: string): Promise<void> {
  await removeExistingLink(linkPath);
  try {
    await fs.promises.symlink(target, linkPath, 'junction');
    console.log(`Symlink created: ${linkPath} -> ${target}`);
  } catch (err) {
    console.warn('Symlink failed, falling back to copy:', String(err));
    await copyDir(target, linkPath);
    console.log(`Copied ${target} -> ${linkPath}`);
  }
}

function spawnWatchBuild(projectName: string): ChildProcess {
  const cmd = 'bunx';
  const args = ['nx', 'run', `${projectName}:build`, '--watch'];
  console.log(`Starting build watcher: ${cmd} ${args.join(' ')}`);
  const p = spawn(cmd, args, { stdio: 'inherit' });
  p.on('exit', (code) => console.log(`Build watcher for ${projectName} exited (${code})`));
  return p;
}

interface JsoncResult {
  json: unknown;
  raw: string;
}

function readJsonc(file: string): JsoncResult {
  const raw = fs.readFileSync(file, 'utf8');
  const errors: { message: string }[] = [];
  const json = parseJsonC(raw, errors);
  if (errors.length) {
    throw new Error(`Failed to parse JSONC at ${file}: ${JSON.stringify(errors)}`);
  }
  return { json, raw };
}

function writeJsonc(file: string, originalRaw: string | null, obj: { plugin?: unknown[] }): void {
  const base = originalRaw ?? '';
  const edits = modifyJsonC(base, ['plugin'], obj.plugin ?? [], {
    formattingOptions: { insertSpaces: true, tabSize: 2 },
  });
  const newText = applyEdits(base, edits);
  fs.writeFileSync(file, newText, 'utf8');
}

async function backupFile(file: string): Promise<void> {
  try {
    await fs.promises.copyFile(file, `${file}.opencode-dev.bak`);
    console.log(`Backed up ${file} -> ${file}.opencode-dev.bak`);
  } catch {}
}

async function revertOpencodeJson(workspaceRoot: string): Promise<void> {
  const candidates = ['opencode.json', 'opencode.jsonc'];
  for (const c of candidates) {
    const p = path.join(workspaceRoot, c);
    const bak = `${p}.opencode-dev.bak`;
    if (fs.existsSync(bak)) {
      await fs.promises.copyFile(bak, p);
      console.log(`Restored ${p} from ${bak}`);
      return;
    }
  }
  console.error('No opencode-dev backup found to revert');
}

interface OpencodeConfig {
  plugin?: unknown[];
}

async function updateOpencodeJson(workspaceRoot: string, pluginLinkPaths: string[]): Promise<void> {
  const candidates = ['opencode.json', 'opencode.jsonc'];
  let target: string | null = null;
  for (const c of candidates) {
    const p = path.join(workspaceRoot, c);
    if (fs.existsSync(p)) {
      target = p;
      break;
    }
  }
  if (!target) {
    target = path.join(workspaceRoot, 'opencode.json');
    console.log('No existing opencode.json found; creating new one at', target);
    const base = { plugin: [] };
    await fs.promises.writeFile(target, `${JSON.stringify(base, null, 2)}\n`, 'utf8');
  }
  await backupFile(target);
  const { json, raw } = readJsonc(target);
  const config = json as OpencodeConfig;
  if (!Array.isArray(config.plugin)) config.plugin = [];
  for (const p of pluginLinkPaths) {
    if (!config.plugin.includes(p)) config.plugin.push(p);
  }
  writeJsonc(target, raw, config);
  console.log('Updated', target);
}

interface MtimeState {
  latest: number;
  stack: string[];
}

function processDirectoryEntries(dir: string, state: MtimeState): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        state.stack.push(p);
      } else {
        try {
          const s = fs.statSync(p);
          if (s.mtimeMs > state.latest) state.latest = s.mtimeMs;
        } catch {}
      }
    }
  } catch {}
}

function getLatestMtime(dir: string): number {
  const state: MtimeState = { latest: 0, stack: [dir] };
  while (state.stack.length) {
    const cur = state.stack.pop();
    if (!cur) continue;
    processDirectoryEntries(cur, state);
  }
  return state.latest;
}

async function isServerListening(disposeUrl: string, timeoutMs = 500): Promise<boolean> {
  try {
    const u = new URL(disposeUrl);
    const port = u.port ? Number(u.port) : u.protocol === 'https:' ? 443 : 80;
    const host = u.hostname;
    return await new Promise((resolve) => {
      const socket = net.connect({ host, port }, () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => {
        try {
          socket.destroy();
        } catch {}
        resolve(false);
      });
      socket.setTimeout(timeoutMs, () => {
        try {
          socket.destroy();
        } catch {}
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

interface FetchError {
  name: string;
  message: string;
}

async function attemptDisposeRequest(url: string, timeoutMs: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    clearTimeout(id);
    if (res.ok) {
      console.log(`Dispose request succeeded (status ${res.status})`);
      return true;
    }
    console.warn(`Dispose request returned ${res.status}`);
    return false;
  } catch (err) {
    const fetchErr = err as FetchError;
    if (fetchErr.name === 'AbortError') {
      console.warn(`Dispose request timed out`);
    } else {
      console.warn(`Dispose request error: ${String(err)}`);
    }
    return false;
  }
}

async function tryDispose(url: string, timeoutMs = 2000, retries = 2): Promise<boolean> {
  if (!url) return false;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const success = await attemptDisposeRequest(url, timeoutMs);
    if (success) return true;
    await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
  }
  return false;
}

interface BuildConfig {
  dir: string;
  distPath: string;
  projectName: string;
}

function createBuildConfig(workspaceRoot: string, spec: string): BuildConfig {
  const dir = resolvePluginDir(workspaceRoot, spec);
  if (!dir) {
    console.error('Could not resolve plugin:', spec);
    process.exit(1);
  }
  return {
    dir,
    distPath: path.join(dir, 'dist'),
    projectName: path.basename(dir),
  };
}

async function startBuildWatcher(config: BuildConfig): Promise<ChildProcess | null> {
  try {
    return spawnWatchBuild(config.projectName);
  } catch (err) {
    console.warn('Failed to start build watcher for', config.projectName, String(err));
    return null;
  }
}

async function waitForDist(distPath: string, maxWait = 30000): Promise<boolean> {
  const start = Date.now();
  while (!fs.existsSync(distPath)) {
    if (Date.now() - start > maxWait) return false;
    await new Promise((r) => setTimeout(r, 300));
  }
  return true;
}

async function createPluginLink(config: BuildConfig, symlinkRoot: string, workspaceRoot: string): Promise<string> {
  const linkRoot = path.resolve(workspaceRoot, symlinkRoot);
  await ensureDir(linkRoot);
  const linkPath = path.join(linkRoot, config.projectName);

  if (fs.existsSync(config.distPath)) {
    await createSymlink(config.distPath, linkPath);
  } else {
    await ensureDir(linkPath);
    console.log('Created placeholder folder for', linkPath);
  }
  return linkPath;
}

interface CleanupState {
  buildProcesses: ChildProcess[];
  opProcess: ChildProcess | null;
}

function setupCleanupHandlers(state: CleanupState): void {
  process.on('SIGINT', async () => {
    console.log('\nInterrupted. Cleaning up...');
    for (const b of state.buildProcesses) {
      try {
        b.kill();
      } catch {}
    }
    if (state.opProcess) {
      try {
        state.opProcess.kill();
      } catch {}
    }
    process.exit(0);
  });
}

function spawnOpencode(workspaceRoot: string): ChildProcess {
  console.log('Starting opencode CLI in', workspaceRoot);
  const opProcess = spawn('opencode', [], { cwd: workspaceRoot, stdio: 'inherit' });
  opProcess.on('exit', (code) => {
    console.log('opencode exited', code);
    process.exit(code ?? 0);
  });
  return opProcess;
}

async function detectServerAvailability(disposeUrl: string, disposeEnabled: boolean): Promise<boolean> {
  if (!disposeEnabled || !disposeUrl) return false;
  try {
    return await isServerListening(disposeUrl);
  } catch {
    return false;
  }
}

interface ReloadResult {
  shouldRestart: boolean;
  message: string;
}

async function handleReload(disposeUrl: string, disposeEnabled: boolean, state: CleanupState): Promise<ReloadResult> {
  if (!disposeEnabled || !disposeUrl) {
    return { shouldRestart: true, message: 'Dispose not enabled' };
  }

  const listening = await isServerListening(disposeUrl);
  if (!listening) {
    return { shouldRestart: true, message: 'Server not reachable' };
  }

  const disposed = await tryDispose(disposeUrl);
  if (disposed) {
    return { shouldRestart: false, message: 'Server reload requested' };
  }

  return { shouldRestart: true, message: 'Dispose request failed' };
}

async function initializePlugins(opts: Opts, state: CleanupState): Promise<{ links: string[]; distPaths: string[] }> {
  const links: string[] = [];
  const distPaths: string[] = [];

  for (const spec of opts.plugins) {
    const config = createBuildConfig(opts.workspaceRoot, spec);
    const watcher = await startBuildWatcher(config);
    if (watcher) state.buildProcesses.push(watcher);

    console.log(`Waiting for dist at ${config.distPath}...`);
    const hasDist = await waitForDist(config.distPath);
    if (!hasDist) {
      console.warn('dist not found for', config.projectName, '- will create link when available');
    }

    const linkPath = await createPluginLink(config, opts.symlinkRoot, opts.workspaceRoot);
    links.push(linkPath);
    distPaths.push(config.distPath);
  }

  return { links, distPaths };
}

function createFileUris(links: string[]): string[] {
  return links.map((lp) => {
    const indexJs = path.join(lp, 'index.js');
    return fs.existsSync(indexJs) ? `file://${indexJs}` : `file://${lp}`;
  });
}

async function setupServerMode(
  opts: Opts,
  state: CleanupState,
): Promise<{ isServerMode: boolean; initialStart: boolean }> {
  const serverAvailable = await detectServerAvailability(opts.disposeUrl, opts.disposeEnabled);

  if (serverAvailable) {
    console.log(`Server detected at ${opts.disposeUrl}; reload via HTTP.`);
    return { isServerMode: true, initialStart: false };
  }

  console.log('No server detected; starting local opencode CLI.');
  state.opProcess = spawnOpencode(opts.workspaceRoot);
  return { isServerMode: false, initialStart: true };
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

  const { isServerMode } = await setupServerMode(opts, state);
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
