import fs from 'node:fs';
import { applyEdits, modify as modifyJsonC } from 'jsonc-parser';
import type { OpencodeConfig } from '../types';

export function writeJsonc(file: string, originalRaw: string | null, obj: OpencodeConfig): void {
  const base = originalRaw ?? '';
  const edits = modifyJsonC(base, ['plugin'], obj.plugin ?? [], {
    formattingOptions: { insertSpaces: true, tabSize: 2 },
  });
  const newText = applyEdits(base, edits);
  fs.writeFileSync(file, newText, 'utf8');
}
