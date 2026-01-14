import { mkdtemp, mkdir, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, it, expect } from 'bun:test';

import { findFiles } from './find-files';

describe('findFiles', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    testDir = await mkdtemp(join(tmpdir(), 'findfiles-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await rm(testDir, { recursive: true, force: true });
  });

  it('should find files with specified extensions', async () => {
    // Create test files
    await writeFile(join(testDir, 'file1.ts'), 'content');
    await writeFile(join(testDir, 'file2.js'), 'content');
    await writeFile(join(testDir, 'file3.txt'), 'content');

    const files = await findFiles(testDir, ['.ts', '.js']);

    expect(files).toHaveLength(2);
    expect(files).toContain(join(testDir, 'file1.ts'));
    expect(files).toContain(join(testDir, 'file2.js'));
    expect(files).not.toContain(join(testDir, 'file3.txt'));
  });

  it('should recursively search subdirectories', async () => {
    // Create nested directory structure
    await mkdir(join(testDir, 'subdir1'));
    await mkdir(join(testDir, 'subdir1', 'subdir2'));

    await writeFile(join(testDir, 'root.ts'), 'content');
    await writeFile(join(testDir, 'subdir1', 'nested1.ts'), 'content');
    await writeFile(join(testDir, 'subdir1', 'subdir2', 'nested2.js'), 'content');

    const files = await findFiles(testDir, ['.ts', '.js']);

    expect(files).toHaveLength(3);
    expect(files).toContain(join(testDir, 'root.ts'));
    expect(files).toContain(join(testDir, 'subdir1', 'nested1.ts'));
    expect(files).toContain(join(testDir, 'subdir1', 'subdir2', 'nested2.js'));
  });

  it('should return empty array when no matching files exist', async () => {
    await writeFile(join(testDir, 'file.txt'), 'content');

    const files = await findFiles(testDir, ['.ts', '.js']);

    expect(files).toHaveLength(0);
  });

  it('should return empty array for empty directory', async () => {
    const files = await findFiles(testDir, ['.ts', '.js']);

    expect(files).toHaveLength(0);
  });

  it('should handle multiple extensions correctly', async () => {
    await writeFile(join(testDir, 'file.ts'), 'content');
    await writeFile(join(testDir, 'file.js'), 'content');
    await writeFile(join(testDir, 'file.mjs'), 'content');
    await writeFile(join(testDir, 'file.json'), 'content');

    const files = await findFiles(testDir, ['.ts', '.js', '.mjs']);

    expect(files).toHaveLength(3);
    expect(files).toContain(join(testDir, 'file.ts'));
    expect(files).toContain(join(testDir, 'file.js'));
    expect(files).toContain(join(testDir, 'file.mjs'));
    expect(files).not.toContain(join(testDir, 'file.json'));
  });

  it('should ignore files that partially match extension', async () => {
    await writeFile(join(testDir, 'file.ts'), 'content');
    await writeFile(join(testDir, 'file.tsx'), 'content'); // Should not match .ts
    await writeFile(join(testDir, 'myfile.js.backup'), 'content'); // Should not match .js

    const files = await findFiles(testDir, ['.ts', '.js']);

    expect(files).toHaveLength(1);
    expect(files).toContain(join(testDir, 'file.ts'));
  });
});
