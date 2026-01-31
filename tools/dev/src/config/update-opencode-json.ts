import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { OpencodeConfig } from '../types';
import { backupFile } from './backup-file';
import { readJsonc } from './read-jsonc';
import { writeJsonc } from './write-jsonc';

export async function updateOpencodeJson(workspaceRoot: string, pluginLinkPaths: string[]): Promise<void> {
  const candidates = ['opencode.json', 'opencode.jsonc'];
  let target: string | null = null;
  for (const c of candidates) {
    const p = path.join(workspaceRoot, c);
    if (fsSync.existsSync(p)) {
      target = p;
      break;
    }
  }
  if (!target) {
    target = path.join(workspaceRoot, 'opencode.json');
    console.log('No existing opencode.json found; creating new one at', target);
    const base = { plugin: [] };
    await fs.writeFile(target, `${JSON.stringify(base, null, 2)}\n`, 'utf8');
  }
  await backupFile(target);
  const { json, raw } = readJsonc(target);
  const config = json as OpencodeConfig;
  if (!Array.isArray(config.plugin)) config.plugin = [];
  for (const p of pluginLinkPaths) {
    if (!config.plugin.includes(p)) config.plugin.push(p);
  }
  writeJsonc(target, raw, config);
  console.log('Updated', target);
}
