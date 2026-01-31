import type { Opts } from '../types';

export function createDefaultOpts(): Opts {
  return {
    plugins: [],
    symlinkRoot: '.opencode/plugin',
    apply: true,
    revert: false,
    workspaceRoot: process.cwd(),
    disposeEnabled: true,
    disposeUrl: 'http://localhost:4096/instance/dispose',
  };
}
