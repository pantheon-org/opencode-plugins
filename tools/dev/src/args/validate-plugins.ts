import type { Opts } from '../types';

export function validatePlugins(opts: Opts): void {
  if (opts.plugins.length === 0) {
    console.error('Error: at least one plugin must be provided');
    process.exit(1);
  }
}
