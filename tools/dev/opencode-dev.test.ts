import { beforeEach, describe, expect, it, jest } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from './src/args/parse-args';
import { validatePlugins } from './src/args/validate-plugins';
import { createBuildConfig } from './src/build/create-build-config';
import { readJsonc } from './src/config/read-jsonc';
import { writeJsonc } from './src/config/write-jsonc';
import { createFileUris } from './src/create-file-uris';
import { createSymlink } from './src/fs/create-symlink';
import { ensureDir } from './src/fs/ensure-dir';
import { getLatestMtime } from './src/fs/get-latest-mtime';
import { isDir } from './src/fs/is-dir';
import { processDirectoryEntries } from './src/fs/process-directory-entries';
import { attemptDisposeRequest } from './src/server/attempt-dispose-request';
import { isServerListening } from './src/server/is-server-listening';
import { tryDispose } from './src/server/try-dispose';
import type { MtimeState, Opts } from './src/types';

describe('opencode-dev', () => {
  describe('createBuildConfig', () => {
    it('should resolve plugin directory from relative path', () => {
      const result = createBuildConfig(process.cwd(), 'packages/opencode-skills');
      expect(result.projectName).toBe('opencode-skills');
      expect(result.distPath).toContain('dist');
    });

    it('should resolve plugin directory from package name', () => {
      const result = createBuildConfig(process.cwd(), 'opencode-skills');
      expect(result.projectName).toBe('opencode-skills');
    });

    it('should resolve plugin directory from short name', () => {
      const result = createBuildConfig(process.cwd(), 'skills');
      expect(result.projectName).toBe('opencode-skills');
    });
  });

  describe('ensureDir', () => {
    it('should create directory recursively', async () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      const testDir = path.join(tmpDir, 'nested', 'dir');
      await ensureDir(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('isDir', () => {
    it('should return true for existing directory', () => {
      expect(isDir(process.cwd())).toBe(true);
    });

    it('should return false for non-existent path', () => {
      expect(isDir('/nonexistent/path/12345')).toBe(false);
    });

    it('should return false for file', () => {
      const tmpFile = path.join(os.tmpdir(), `test-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, 'test');
      expect(isDir(tmpFile)).toBe(false);
      fs.unlinkSync(tmpFile);
    });
  });

  describe('getLatestMtime', () => {
    it('should return 0 for empty directory', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      const result = getLatestMtime(tmpDir);
      expect(result).toBe(0);
      fs.rmSync(tmpDir, { recursive: true });
    });

    it('should return mtime of single file', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      const testFile = path.join(tmpDir, 'test.txt');
      fs.writeFileSync(testFile, 'test');
      const expectedMtime = fs.statSync(testFile).mtimeMs;
      const result = getLatestMtime(tmpDir);
      expect(result).toBe(expectedMtime);
      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('processDirectoryEntries', () => {
    it('should process directory entries into stack', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      fs.mkdirSync(path.join(tmpDir, 'subdir'));
      fs.writeFileSync(path.join(tmpDir, 'file.txt'), 'test');

      const state: MtimeState = { latest: 0, stack: [] };
      processDirectoryEntries(tmpDir, state);

      expect(state.stack.length).toBe(1);
      expect(state.stack[0]).toContain('subdir');
      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('readJsonc', () => {
    it('should parse valid JSONC file', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      const jsoncFile = path.join(tmpDir, 'test.jsonc');
      fs.writeFileSync(jsoncFile, '{ "key": "value" }');

      const result = readJsonc(jsoncFile);
      expect(result.json).toEqual({ key: 'value' });
      expect(result.raw).toBe('{ "key": "value" }');
      fs.rmSync(tmpDir, { recursive: true });
    });

    it('should throw on invalid JSONC', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      const jsoncFile = path.join(tmpDir, 'invalid.jsonc');
      fs.writeFileSync(jsoncFile, 'not valid json');

      expect(() => readJsonc(jsoncFile)).toThrow();
      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('writeJsonc', () => {
    it('should write valid JSONC file', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      const jsoncFile = path.join(tmpDir, 'test.jsonc');

      writeJsonc(jsoncFile, null, { plugin: ['file://test'] });
      const content = fs.readFileSync(jsoncFile, 'utf8');
      expect(content).toContain('plugin');
      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('isServerListening', () => {
    it('should return false for non-existent server', async () => {
      const result = await isServerListening('http://localhost:59999', 100);
      expect(result).toBe(false);
    });
  });

  describe('attemptDisposeRequest', () => {
    it('should handle connection refused', async () => {
      const result = await attemptDisposeRequest('http://localhost:59999/dispose', 100);
      expect(result).toBe(false);
    });
  });

  describe('tryDispose', () => {
    it('should return false for non-existent server', async () => {
      const result = await tryDispose('http://localhost:59999/dispose', 100, 0);
      expect(result).toBe(false);
    });

    it('should return false for empty URL', async () => {
      const result = await tryDispose('', 100, 0);
      expect(result).toBe(false);
    });
  });

  describe('createSymlink', () => {
    it('should fallback to copy on symlink failure', async () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      const sourceDir = path.join(tmpDir, 'source');
      const linkDir = path.join(tmpDir, 'link');
      fs.mkdirSync(sourceDir);
      fs.writeFileSync(path.join(sourceDir, 'file.txt'), 'test');

      await createSymlink(sourceDir, linkDir);
      expect(fs.existsSync(path.join(linkDir, 'file.txt'))).toBe(true);
      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('createFileUris', () => {
    it('should create file URIs with index.js when present', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      fs.writeFileSync(path.join(tmpDir, 'index.js'), '');

      const result = createFileUris([tmpDir]);
      expect(result[0]).toBe(`file://${path.join(tmpDir, 'index.js')}`);
      fs.rmSync(tmpDir, { recursive: true });
    });

    it('should create file URIs without index.js when not present', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
      fs.mkdirSync(tmpDir);

      const result = createFileUris([tmpDir]);
      expect(result[0]).toBe(`file://${tmpDir}`);
      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('parseArgs', () => {
    it('should parse plugin arguments', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script', 'opencode-skills'];

      const result = parseArgs();
      expect(result.plugins).toContain('opencode-skills');

      process.argv = originalArgv;
    });

    it('should parse --no-apply flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script', '--no-apply', 'opencode-skills'];

      const result = parseArgs();
      expect(result.apply).toBe(false);

      process.argv = originalArgv;
    });

    it('should parse --revert flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script', '--revert'];

      const result = parseArgs();
      expect(result.revert).toBe(true);

      process.argv = originalArgv;
    });
  });

  describe('validatePlugins', () => {
    it('should not throw when plugins are provided', () => {
      const opts: Opts = {
        plugins: ['opencode-skills'],
        symlinkRoot: '.opencode/plugin',
        apply: true,
        revert: false,
        workspaceRoot: process.cwd(),
        disposeEnabled: true,
        disposeUrl: 'http://localhost:4096/instance/dispose',
      };

      expect(() => validatePlugins(opts)).not.toThrow();
    });

    it('should throw when no plugins provided', () => {
      const opts: Opts = {
        plugins: [],
        symlinkRoot: '.opencode/plugin',
        apply: true,
        revert: false,
        workspaceRoot: process.cwd(),
        disposeEnabled: true,
        disposeUrl: 'http://localhost:4096/instance/dispose',
      };

      expect(() => validatePlugins(opts)).toThrow();
    });
  });
});
