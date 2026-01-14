/**
 * Recursively find files with specified extensions in a directory
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Recursively find files with specified extensions
 *
 * @param dir - Directory to search
 * @param extensions - Array of file extensions to match (e.g., ['.ts', '.js'])
 * @returns Array of absolute file paths
 */
export const findFiles = async (dir: string, extensions: string[]): Promise<string[]> => {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      const subFiles = await findFiles(fullPath, extensions);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      // Check if file has one of the allowed extensions
      const hasExtension = extensions.some((ext) => entry.name.endsWith(ext));
      if (hasExtension) {
        files.push(fullPath);
      }
    }
  }

  return files;
};
