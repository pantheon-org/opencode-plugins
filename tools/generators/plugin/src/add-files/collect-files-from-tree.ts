import type { Tree } from '@nx/devkit';
import * as path from 'path';

/**
 * Recursively collects all file paths in a directory from the Nx Tree.
 * @param tree - Nx virtual file system
 * @param dirPath - Directory path to collect files from
 * @param files - Map to store file paths and their content
 */
export const collectFilesFromTree = (tree: Tree, dirPath: string, files: Map<string, Buffer>): void => {
  try {
    if (!tree.exists(dirPath)) {
      return;
    }

    const entries = tree.children(dirPath);
    entries.forEach((entry) => {
      const fullPath = path.join(dirPath, entry);
      if (tree.isFile(fullPath)) {
        const content = tree.read(fullPath);
        if (content) {
          files.set(fullPath, content);
        }
      } else {
        collectFilesFromTree(tree, fullPath, files);
      }
    });
  } catch (e) {
    // Directory might not exist or be readable
    console.warn(`Warning: Could not read directory ${dirPath}:`, e);
  }
};
