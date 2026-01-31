import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { backupFile } from './backup-file';

describe('backupFile', () => {
  it('should create backup of existing file', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));
    const testFile = path.join(tmpDir, 'test.json');
    fs.writeFileSync(testFile, '{"test": true}');

    await backupFile(testFile);

    const backupPath = `${testFile}.opencode-dev.bak`;
    expect(fs.existsSync(backupPath)).toBe(true);
    expect(fs.readFileSync(backupPath, 'utf8')).toBe('{"test": true}');

    fs.rmSync(tmpDir, { recursive: true });
  });

  it('should not throw for non-existent file', async () => {
    const nonExistentFile = '/nonexistent/file/12345.json';

    await expect(backupFile(nonExistentFile)).resolves.not.toThrow();
  });
});
