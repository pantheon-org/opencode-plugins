import type { Opts } from '../types';
import { printHelp } from './print-help';

interface ParseFlagResult {
  newIndex: number;
  updated: boolean;
}

export function parseFlag(argv: string[], index: number, opts: Partial<Opts>): ParseFlagResult {
  const a = argv[index];

  if (a === '--no-apply') {
    opts.apply = false;
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--symlink-root' && argv[index + 1]) {
    opts.symlinkRoot = argv[++index];
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--revert') {
    opts.revert = true;
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--no-dispose') {
    opts.disposeEnabled = false;
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--dispose-url' && argv[index + 1]) {
    opts.disposeUrl = argv[++index];
    return { newIndex: index + 1, updated: true };
  }
  if (a === '--help' || a === '-h') {
    printHelp();
  }

  return { newIndex: index + 1, updated: false };
}
