import { describe, expect, it } from 'bun:test';
import { createDefaultOpts } from './create-default-opts';

describe('createDefaultOpts', () => {
  it('should create default options', () => {
    const result = createDefaultOpts();

    expect(result.plugins).toEqual([]);
    expect(result.symlinkRoot).toBe('.opencode/plugin');
    expect(result.apply).toBe(true);
    expect(result.revert).toBe(false);
    expect(result.workspaceRoot).toBe(process.cwd());
    expect(result.disposeEnabled).toBe(true);
    expect(result.disposeUrl).toBe('http://localhost:4096/instance/dispose');
  });
});
