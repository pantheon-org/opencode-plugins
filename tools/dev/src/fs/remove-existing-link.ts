import fs from 'node:fs/promises';

export const removeExistingLink = async (linkPath: string): Promise<void> => {
  try {
    await fs.lstat(linkPath);
    await fs.rm(linkPath, { recursive: true });
  } catch {}
};
