import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { waitForDist } from './wait-for-dist';

describe('waitForDist', () => {
  it('should return true when directory exists', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-dev-test-'));

    const result = await waitForDist(tmpDir, 1000);

    expect(result).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('should return false when directory does not exist within timeout', async () => {
    const nonExistentPath = '/nonexistent/path/12345';

    const result = await waitForDist(nonExistentPath, 100);

    expect(result).toBe(false);
  });
});
