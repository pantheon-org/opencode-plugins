import fs from 'node:fs';
import path from 'node:path';
import type { MtimeState } from '../types';

export const processDirectoryEntries = (dir: string, state: MtimeState): void => {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        state.stack.push(p);
      } else {
        try {
          const s = fs.statSync(p);
          if (s.mtimeMs > state.latest) state.latest = s.mtimeMs;
        } catch {}
      }
    }
  } catch {}
};
