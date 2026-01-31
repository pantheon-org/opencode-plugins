import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function revertOpencodeJson(workspaceRoot: string): Promise<void> {
  const candidates = ['opencode.json', 'opencode.jsonc'];
  for (const c of candidates) {
    const p = path.join(workspaceRoot, c);
    const bak = `${p}.opencode-dev.bak`;
    if (fsSync.existsSync(p) && (await fs.stat(bak).catch(() => null))) {
      await fs.copyFile(bak, p);
      console.log(`Restored ${p} from ${bak}`);
      return;
    }
  }
  console.error('No opencode-dev backup found to revert');
}
