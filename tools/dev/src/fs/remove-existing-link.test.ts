import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { removeExistingLink } from './remove-existing-link';

describe('removeExistingLink', () => {
  it('should remove existing symlink', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
    const sourceDir = path.join(tmpDir, 'source');
    const linkPath = path.join(tmpDir, 'link');
    fs.mkdirSync(sourceDir);
    fs.symlinkSync(sourceDir, linkPath, 'junction');

    await removeExistingLink(linkPath);

    expect(fs.existsSync(linkPath)).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('should remove existing directory', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
    const dirPath = path.join(tmpDir, 'testdir');
    fs.mkdirSync(dirPath);

    await removeExistingLink(dirPath);

    expect(fs.existsSync(dirPath)).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('should not throw for non-existent path', async () => {
    await expect(removeExistingLink('/nonexistent/path')).resolves.not.toThrow();
  });
});
