import fs from 'node:fs';
import path from 'node:path';
import { copyDir } from './copy-dir';
import { createSymlink } from './create-symlink';
import { ensureDir } from './ensure-dir';
import { removeExistingLink } from './remove-existing-link';

export const createPluginLink = async (
  distPath: string,
  projectName: string,
  symlinkRoot: string,
  workspaceRoot: string,
): Promise<string> => {
  const linkRoot = path.resolve(workspaceRoot, symlinkRoot);
  await ensureDir(linkRoot);
  const linkPath = path.join(linkRoot, projectName);

  if (fs.existsSync(distPath)) {
    await removeExistingLink(linkPath);
    try {
      await fs.promises.symlink(distPath, linkPath, 'junction');
      console.log(`Symlink created: ${linkPath} -> ${distPath}`);
    } catch (err) {
      console.warn('Symlink failed, falling back to copy:', String(err));
      await copyDir(distPath, linkPath);
      console.log(`Copied ${distPath} -> ${linkPath}`);
    }
  } else {
    await ensureDir(linkPath);
    console.log('Created placeholder folder for', linkPath);
  }
  return linkPath;
};
