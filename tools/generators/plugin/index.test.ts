import { describe, it, expect } from 'bun:test';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generator from './index';

describe('plugin generator', () => {
  it('creates files (dry run)', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await generator(tree, { name: 'test-plugin', directory: 'packages', addTests: false, description: '' });
    expect(tree.exists('packages/opencode-test-plugin/package.json')).toBeTruthy();
  });
});
