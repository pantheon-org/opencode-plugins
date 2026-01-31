import { describe, expect, it } from 'bun:test';
import type { Opts } from '../types';
import { parseFlag } from './parse-flag';

describe('parseFlag', () => {
  it('should parse --no-apply flag', () => {
    const argv = ['--no-apply'];
    const opts: Partial<Opts> = {};

    const result = parseFlag(argv, 0, opts);

    expect(result.updated).toBe(true);
    expect(result.newIndex).toBe(1);
    expect(opts.apply).toBe(false);
  });

  it('should parse --symlink-root with value', () => {
    const argv = ['--symlink-root', 'custom/path'];
    const opts: Partial<Opts> = { symlinkRoot: '.opencode/plugin' };

    const result = parseFlag(argv, 0, opts);

    expect(result.updated).toBe(true);
    expect(result.newIndex).toBe(2);
    expect(opts.symlinkRoot).toBe('custom/path');
  });

  it('should parse --revert flag', () => {
    const argv = ['--revert'];
    const opts: Partial<Opts> = {};

    const result = parseFlag(argv, 0, opts);

    expect(result.updated).toBe(true);
    expect(opts.revert).toBe(true);
  });

  it('should parse --no-dispose flag', () => {
    const argv = ['--no-dispose'];
    const opts: Partial<Opts> = {};

    const result = parseFlag(argv, 0, opts);

    expect(result.updated).toBe(true);
    expect(opts.disposeEnabled).toBe(false);
  });

  it('should parse --dispose-url with value', () => {
    const argv = ['--dispose-url', 'http://localhost:8080'];
    const opts: Partial<Opts> = { disposeUrl: 'http://localhost:4096' };

    const result = parseFlag(argv, 0, opts);

    expect(result.updated).toBe(true);
    expect(result.newIndex).toBe(2);
    expect(opts.disposeUrl).toBe('http://localhost:8080');
  });

  it('should not update for unknown flag', () => {
    const argv = ['unknown-flag'];
    const opts: Partial<Opts> = {};

    const result = parseFlag(argv, 0, opts);

    expect(result.updated).toBe(false);
    expect(result.newIndex).toBe(1);
  });

  it('should handle empty argv', () => {
    const argv: string[] = [];
    const opts: Partial<Opts> = {};

    expect(() => parseFlag(argv, 0, opts)).toThrow();
  });
});
