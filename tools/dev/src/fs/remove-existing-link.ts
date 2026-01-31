import fs from 'node:fs/promises';

export async function removeExistingLink(linkPath: string): Promise<void> {
  try {
    await fs.lstat(linkPath);
    await fs.rm(linkPath, { recursive: true });
  } catch {}
}
