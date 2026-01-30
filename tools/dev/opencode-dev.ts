#!/usr/bin/env bunx tsx
import { type ChildProcess, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

type Opts = {
  plugins: string[];
  symlinkRoot: string;
  apply: boolean;
  revert: boolean;
  workspaceRoot: string;
  disposeEnabled: boolean;
  disposeUrl: string;
};

function parseArgs(): Opts {
  const argv = process.argv.slice(2);
  const plugins: string[] = [];
  let symlinkRoot = '.opencode/plugin';
  let apply = true;
  let revert = false;
  let disposeEnabled = true;
  let disposeUrl = 'http://localhost:4096/instance/dispose';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-apply') apply = false;
    else if (a === '--symlink-root' && argv[i + 1]) {
      symlinkRoot = argv[++i];
    } else if (a === '--revert') {
      revert = true;
    } else if (a === '--no-dispose') {
      disposeEnabled = false;
    } else if (a === '--dispose-url' && argv[i + 1]) {
      disposeUrl = argv[++i];
    } else if (a === '--help' || a === '-h') {
      process.exit(0);
    } else {
      plugins.push(a);
    }
  }
  if (revert)
    return {
      plugins: [],
      symlinkRoot,
      apply: false,
      revert: true,
      workspaceRoot: process.cwd(),
      disposeEnabled,
      disposeUrl,
    };
  if (plugins.length === 0) {
    console.error('Error: at least one plugin (package folder or name) must be provided');
    process.exit(1);
  }
  return { plugins, symlinkRoot, apply, revert, workspaceRoot: process.cwd(), disposeEnabled, disposeUrl };
}

function isDir(p: string) {
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

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function createSymlink(target: string, linkPath: string) {
  try {
    try {
      await fs.promises.lstat(linkPath);
      await fs.promises.rm(linkPath, { recursive: true });
    } catch {}
    await fs.promises.symlink(target, linkPath, 'junction');
  } catch (err) {
    console.warn('Symlink failed, falling back to copy:', String(err));
    await copyDir(target, linkPath);
  }
}

async function copyDir(src: string, dest: string) {
  await ensureDir(dest);
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(srcPath, destPath);
    else await fs.promises.copyFile(srcPath, destPath);
  }
}

function spawnWatchBuild(projectName: string) {
  const cmd = 'bunx';
  const args = ['nx', 'run', `${projectName}:build`, '--watch'];
  const p = spawn(cmd, args, { stdio: 'inherit' });
  p.on('exit', (_code) => {});
  return p;
}

import { applyEdits, modify as modifyJsonC, parse as parseJsonC } from 'jsonc-parser';

function readJsonc(file: string): { json: any; raw: string } {
  const raw = fs.readFileSync(file, 'utf8');
  const errors: any[] = [];
  const json = parseJsonC(raw, errors, { allowTrailingComma: true });
  if (errors.length) {
    throw new Error(`Failed to parse JSONC at ${file}: ${JSON.stringify(errors)}`);
  }
  return { json, raw };
}

function writeJsonc(file: string, originalRaw: string | null, obj: any) {
  // Use modify to produce minimal edits preserving comments
  const base = originalRaw || '';
  const edits = modifyJsonC(base, ['plugin'], obj.plugin || [], {
    formattingOptions: { insertSpaces: true, tabSize: 2 },
  });
  const newText = applyEdits(base, edits);
  fs.writeFileSync(file, newText, 'utf8');
}

async function backupFile(file: string) {
  try {
    await fs.promises.copyFile(file, `${file}.opencode-dev.bak`);
  } catch (_err) {}
}

async function revertOpencodeJson(workspaceRoot: string) {
  const candidates = ['opencode.json', 'opencode.jsonc'];
  for (const c of candidates) {
    const p = path.join(workspaceRoot, c);
    const bak = `${p}.opencode-dev.bak`;
    if (fs.existsSync(bak)) {
      await fs.promises.copyFile(bak, p);
      return;
    }
  }
  console.error('No opencode-dev backup found to revert');
}

async function updateOpencodeJson(workspaceRoot: string, pluginLinkPaths: string[]) {
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
    const base = { plugin: [] };
    await fs.promises.writeFile(target, `${JSON.stringify(base, null, 2)}\n`, 'utf8');
  }
  await backupFile(target);
  const { json: original, raw } = readJsonc(target);
  const json = original || {};
  if (!Array.isArray(json.plugin)) json.plugin = [];
  for (const p of pluginLinkPaths) if (!json.plugin.includes(p)) json.plugin.push(p);
  writeJsonc(target, raw, json);
}

function getLatestMtime(dir: string): number {
  let latest = 0;
  try {
    const stack = [dir];
    while (stack.length) {
      const cur = stack.pop() as string;
      const entries = fs.readdirSync(cur, { withFileTypes: true });
      for (const e of entries) {
        const p = path.join(cur, e.name);
        if (e.isDirectory()) stack.push(p);
        else {
          try {
            const s = fs.statSync(p);
            const m = s.mtimeMs;
            if (m > latest) latest = m;
          } catch {}
        }
      }
    }
  } catch {}
  return latest;
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
  } catch (_err) {
    return false;
  }
}

async function tryDispose(url: string, timeoutMs = 2000, retries = 2): Promise<boolean> {
  if (!url) return false;
  for (let attempt = 0; attempt <= retries; attempt++) {
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
        return true;
      } else {
        console.warn(`Dispose request to ${url} returned ${res.status}`);
      }
    } catch (err) {
      if ((err as any).name === 'AbortError') console.warn(`Dispose request to ${url} timed out`);
      else console.warn(`Dispose request error: ${String(err)}`);
    }
    // small backoff
    await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
  }
  return false;
}

async function main() {
  const opts = parseArgs();
  if (opts.revert) {
    await revertOpencodeJson(opts.workspaceRoot);
    process.exit(0);
  }

  const createdLinks: string[] = [];
  const buildProcesses: ChildProcess[] = [];
  const distPaths: string[] = [];
  let opProcess: ChildProcess | null = null;
  let restarting = false;

  process.on('SIGINT', async () => {
    for (const b of buildProcesses)
      try {
        b.kill();
      } catch {}
    if (opProcess)
      try {
        opProcess.kill();
      } catch {}
    process.exit(0);
  });

  for (const spec of opts.plugins) {
    const dir = resolvePluginDir(opts.workspaceRoot, spec);
    if (!dir) {
      console.error('Could not resolve plugin:', spec);
      process.exit(1);
    }
    const distPath = path.join(dir, 'dist');
    const projectName = path.basename(dir);
    try {
      const p = spawnWatchBuild(projectName);
      buildProcesses.push(p);
    } catch (err) {
      console.warn('Failed to start NX build watcher for', projectName, String(err));
    }
    const maxWait = 30000;
    const start = Date.now();
    while (!fs.existsSync(distPath)) {
      if (Date.now() - start > maxWait) break;
      await new Promise((r) => setTimeout(r, 300));
    }
    if (!fs.existsSync(distPath))
      console.warn('dist not found for', projectName, '- continuing and will create link if/when it appears');
    const linkRoot = path.resolve(opts.workspaceRoot, opts.symlinkRoot);
    await ensureDir(linkRoot);
    const linkPath = path.join(linkRoot, projectName);
    if (fs.existsSync(distPath)) await createSymlink(distPath, linkPath);
    else {
      await ensureDir(linkPath);
    }
    createdLinks.push(linkPath);
    distPaths.push(distPath);
  }

  const fileUris = createdLinks.map((lp) => {
    const indexJs = path.join(lp, 'index.js');
    return fs.existsSync(indexJs) ? `file://${indexJs}` : `file://${lp}`;
  });
  if (opts.apply) await updateOpencodeJson(opts.workspaceRoot, fileUris);
  else {
    for (const f of fileUris) {
      console.log(f);
    }
  }

  function spawnOpencode() {
    if (opProcess) {
      try {
        opProcess.kill();
      } catch {}
      opProcess = null;
    }
    opProcess = spawn('opencode', [], { cwd: opts.workspaceRoot, stdio: 'inherit' });
    opProcess.on('exit', (code) => {
      if (!restarting) process.exit(code || 0);
    });
  }

  // Detect if a running Opencode server is available at the configured dispose URL.
  // If so, we will prefer to request a reload via the HTTP endpoint and NOT spawn a local `opencode` CLI.
  let serverAvailable = false;
  if (opts.disposeEnabled && opts.disposeUrl) {
    try {
      serverAvailable = await isServerListening(opts.disposeUrl);
    } catch (_err) {
      serverAvailable = false;
    }
  }

  if (serverAvailable) {
  } else {
    spawnOpencode();
  }

  const lastMtimes = distPaths.map((dp) => getLatestMtime(dp));
  setInterval(() => {
    (async () => {
      try {
        for (let i = 0; i < distPaths.length; i++) {
          const dp = distPaths[i];
          const last = lastMtimes[i] || 0;
          const now = getLatestMtime(dp);
          if (now > last) {
            lastMtimes[i] = now;
            if (!restarting) {
              restarting = true;
              // First try to call the Opencode dispose endpoint to reload config
              let disposed = false;
              if (opts.disposeEnabled && opts.disposeUrl) {
                try {
                  const listening = await isServerListening(opts.disposeUrl);
                  if (listening) {
                    disposed = await tryDispose(opts.disposeUrl);
                  } else {
                  }
                } catch (err) {
                  console.warn('Dispose request failed:', String(err));
                }
              }

              if (disposed) {
                restarting = false;
              } else {
                if (opProcess)
                  try {
                    opProcess.kill();
                  } catch {}
                setTimeout(() => {
                  restarting = false;
                  spawnOpencode();
                }, 300);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Watch poll error', String(err));
      }
    })().catch((err) => console.warn('Watch handler error', String(err)));
  }, 1000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
