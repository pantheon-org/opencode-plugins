import fs from 'fs';
import path from 'path';

import { parse as parseJsonC, modify as modifyJsonC, applyEdits } from 'jsonc-parser';

export function readJsonc(file: string): { json: any; raw: string } {
  const raw = fs.readFileSync(file, 'utf8');
  const errors: any[] = [];
  const json = parseJsonC(raw, errors, { allowTrailingComma: true });
  if (errors.length) throw new Error('parse error');
  return { json, raw };
}

export function writeJsonc(file: string, originalRaw: string | null, obj: any) {
  const base = originalRaw || '';
  const edits = modifyJsonC(base, ['plugin'], obj.plugin || [], {
    formattingOptions: { insertSpaces: true, tabSize: 2 },
  } as any);
  const newText = applyEdits(base, edits);
  fs.writeFileSync(file, newText, 'utf8');
}

export async function createSymlink(target: string, linkPath: string, forceFail = false) {
  try {
    // Simulate symlink failure when forceFail is true
    if (forceFail) throw new Error('simulated symlink failure');
    try {
      await fs.promises.lstat(linkPath);
      await fs.promises.rm(linkPath, { recursive: true });
    } catch {}
    await fs.promises.symlink(target, linkPath, 'junction');
  } catch (err) {
    // fallback to copy
    await copyDir(target, linkPath);
  }
}

export async function copyDir(src: string, dest: string) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(srcPath, destPath);
    else await fs.promises.copyFile(srcPath, destPath);
  }
}

export function getLatestMtime(dir: string): number {
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

// network helpers for tests (mirror production logic)
import net from 'net';

export async function isServerListening(disposeUrl: string, timeoutMs = 500): Promise<boolean> {
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
  } catch (err) {
    return false;
  }
}

export async function tryDispose(url: string, timeoutMs = 2000, retries = 2): Promise<boolean> {
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
      if (res.ok) return true;
    } catch (err) {
      // swallow
    }
    await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
  }
  return false;
}
