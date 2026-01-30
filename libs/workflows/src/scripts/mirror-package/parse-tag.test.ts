import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';

import { parseTag, setOutput } from './parse-tag';

describe('parseTag', () => {
  it('should parse standard plugin tag format', () => {
    const result = parseTag('opencode-my-plugin@v1.0.0');

    expect(result).toEqual({
      name: 'opencode-my-plugin',
      version: 'v1.0.0',
      directory: 'packages/opencode-my-plugin',
    });
  });

  it('should handle refs/tags/ prefix', () => {
    const result = parseTag('refs/tags/opencode-my-plugin@v2.3.4');

    expect(result).toEqual({
      name: 'opencode-my-plugin',
      version: 'v2.3.4',
      directory: 'packages/opencode-my-plugin',
    });
  });

  it('should handle plugin names with multiple hyphens', () => {
    const result = parseTag('opencode-foo-bar-baz@v0.1.0');

    expect(result).toEqual({
      name: 'opencode-foo-bar-baz',
      version: 'v0.1.0',
      directory: 'packages/opencode-foo-bar-baz',
    });
  });

  it('should throw error for invalid tag format (no @v)', () => {
    expect(() => parseTag('opencode-my-plugin-1.0.0')).toThrow('Invalid tag format');
  });

  it('should throw error for empty package name', () => {
    expect(() => parseTag('@v1.0.0')).toThrow('Invalid tag format');
  });

  it('should throw error for empty version', () => {
    expect(() => parseTag('opencode-my-plugin@v')).toThrow('Invalid tag format');
  });
});

describe('setOutput', () => {
  const testOutputFile = '/tmp/test-github-output.txt';
  let originalGitHubOutput: string | undefined;

  beforeEach(() => {
    originalGitHubOutput = process.env.GITHUB_OUTPUT;
  });

  afterEach(async () => {
    // Restore original environment
    if (originalGitHubOutput) {
      process.env.GITHUB_OUTPUT = originalGitHubOutput;
    } else {
      process.env.GITHUB_OUTPUT = undefined;
    }

    // Cleanup test file
    if (existsSync(testOutputFile)) {
      await unlink(testOutputFile);
    }
  });

  it('should write output to GITHUB_OUTPUT file when environment variable is set', async () => {
    process.env.GITHUB_OUTPUT = testOutputFile;

    await setOutput('test-key', 'test-value');

    const content = await Bun.file(testOutputFile).text();
    expect(content).toContain('test-key=test-value');
  });

  it('should append multiple outputs to file', async () => {
    process.env.GITHUB_OUTPUT = testOutputFile;

    await setOutput('key1', 'value1');
    await setOutput('key2', 'value2');

    const content = await Bun.file(testOutputFile).text();
    expect(content).toContain('key1=value1');
    expect(content).toContain('key2=value2');
  });

  it('should handle output when GITHUB_OUTPUT is not set', async () => {
    process.env.GITHUB_OUTPUT = undefined;

    // Should not throw - just logs to console
    await expect(setOutput('test-key', 'test-value')).resolves.toBeUndefined();
  });
});
