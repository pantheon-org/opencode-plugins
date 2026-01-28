import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import fs from 'fs';
import { tmpdir } from 'os';
import path from 'path';

import {
  createSymlink as createSymlinkUtil,
  getLatestMtime as getLatestMtimeUtil,
  readJsonc as readJsoncUtil,
  writeJsonc as writeJsoncUtil,
} from './opencode-dev-test-helpers';

const WORK = path.join(tmpdir(), 'opencode-dev-test');

beforeEach(() => {
  try {
    fs.rmSync(WORK, { recursive: true, force: true });
  } catch {}
  fs.mkdirSync(WORK, { recursive: true });
});

afterEach(() => {
  try {
    fs.rmSync(WORK, { recursive: true, force: true });
  } catch {}
});

describe('JSONC edit preserves comments', () => {
  it('reads and writes JSONC keeping comments', () => {
    const file = path.join(WORK, 'opencode.jsonc');
    const raw = `// top comment\n{\n  // plugins section\n  "plugin": [\n    // existing entry\n    "file:///old/index.js"\n  ]\n}\n`;
    fs.writeFileSync(file, raw, 'utf8');
    const { json, raw: before } = readJsoncUtil(file);
    expect(Array.isArray(json.plugin)).toBe(true);
    // add a plugin
    json.plugin.push('file:///new/index.js');
    writeJsoncUtil(file, before, json);
    const afterRaw = fs.readFileSync(file, 'utf8');
    expect(afterRaw).toContain('// top comment');
    expect(afterRaw).toContain('// plugins section');
    expect(afterRaw).toContain('file:///new/index.js');
  });
});

describe('symlink fallback copy behavior', () => {
  it('falls back to copy when symlink fails', async () => {
    const src = path.join(WORK, 'src');
    const dest = path.join(WORK, 'dest');
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(path.join(src, 'index.js'), 'console.log(1)');
    // Simulate symlink failure by making fs.symlink throw via helper
    await expect(createSymlinkUtil(src, dest, true)).resolves.toBeUndefined();
    expect(fs.existsSync(path.join(dest, 'index.js'))).toBe(true);
  });
});

describe('getLatestMtime detects changes', () => {
  it('returns increasing mtime after file change', async () => {
    const dir = path.join(WORK, 'd');
    fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, 'a.txt');
    fs.writeFileSync(f, 'a');
    const t1 = getLatestMtimeUtil(dir);
    await new Promise((r) => setTimeout(r, 50));
    fs.writeFileSync(f, 'b');
    const t2 = getLatestMtimeUtil(dir);
    expect(t2).toBeGreaterThanOrEqual(t1);
  });
});

import http from 'http';
// Tests for opencode-dev network helpers
import net from 'net';

import { isServerListening as isServerListeningUtil, tryDispose as tryDisposeUtil } from './opencode-dev-test-helpers';

describe('network helpers', () => {
  it('isServerListening returns true for a listening TCP port', async () => {
    const server = net.createServer((s) => s.end());
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const addr = server.address() as net.AddressInfo;
    const url = `http://127.0.0.1:${addr.port}/instance/dispose`;
    const ok = await isServerListeningUtil(url, 500);
    expect(ok).toBe(true);
    server.close();
  });

  it('isServerListening returns false for closed port', async () => {
    // pick a high port that's likely free; bind and close to get the port, then test
    const server = net.createServer();
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const addr = server.address() as net.AddressInfo;
    const port = addr.port;
    server.close();
    const url = `http://127.0.0.1:${port}/instance/dispose`;
    const ok = await isServerListeningUtil(url, 200);
    expect(ok).toBe(false);
  });

  it('tryDispose succeeds against POST endpoint and fails on timeout', async () => {
    // start a small HTTP server that responds to POST
    const server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/instance/dispose') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{}');
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const addr = server.address() as net.AddressInfo;
    const url = `http://127.0.0.1:${addr.port}/instance/dispose`;
    const ok = await tryDisposeUtil(url, 1000, 1);
    expect(ok).toBe(true);
    server.close();

    // now test timeout/path failure - point to a port with no listener
    const server2 = net.createServer();
    await new Promise<void>((resolve) => server2.listen(0, '127.0.0.1', () => resolve()));
    const port2 = (server2.address() as net.AddressInfo).port;
    server2.close();
    const badUrl = `http://127.0.0.1:${port2}/instance/dispose`;
    const ok2 = await tryDisposeUtil(badUrl, 200, 0);
    expect(ok2).toBe(false);
  });
});
