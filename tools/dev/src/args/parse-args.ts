import type { Opts } from '../types';
import { createDefaultOpts } from './create-default-opts';
import { parseFlag } from './parse-flag';
import { validatePlugins } from './validate-plugins';

export const parseArgs = (): Opts => {
  const argv = process.argv.slice(2);
  const opts = createDefaultOpts();

  for (let i = 0; i < argv.length; ) {
    const { newIndex, updated } = parseFlag(argv, i, opts);
    i = newIndex;
    if (!updated) {
      opts.plugins.push(argv[i - 1]);
    }
  }

  if (opts.revert) {
    return {
      plugins: [],
      symlinkRoot: opts.symlinkRoot,
      apply: false,
      revert: true,
      workspaceRoot: opts.workspaceRoot,
      disposeEnabled: opts.disposeEnabled,
      disposeUrl: opts.disposeUrl,
    };
  }

  validatePlugins(opts);
  return opts;
};
