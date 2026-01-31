import fs from 'node:fs';
import type { MtimeState } from '../types';
import { processDirectoryEntries } from './process-directory-entries';

export function getLatestMtime(dir: string): number {
  const state: MtimeState = { latest: 0, stack: [dir] };
  while (state.stack.length) {
    const cur = state.stack.pop();
    if (!cur) continue;
    processDirectoryEntries(cur, state);
  }
  return state.latest;
}
