import fs from 'node:fs/promises';
import { copyDir } from './copy-dir';
import { removeExistingLink } from './remove-existing-link';

export const createSymlink = async (target: string, linkPath: string): Promise<void> => {
  await removeExistingLink(linkPath);
  try {
    await fs.symlink(target, linkPath, 'junction');
    console.log(`Symlink created: ${linkPath} -> ${target}`);
  } catch (err) {
    console.warn('Symlink failed, falling back to copy:', String(err));
    await copyDir(target, linkPath);
    console.log(`Copied ${target} -> ${linkPath}`);
  }
};
