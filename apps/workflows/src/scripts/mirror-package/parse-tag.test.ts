import { describe, it, expect } from 'bun:test';

import { parseTag } from './parse-tag';

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
