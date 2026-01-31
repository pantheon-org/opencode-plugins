import fs from 'node:fs/promises';

export async function backupFile(file: string): Promise<void> {
  try {
    await fs.copyFile(file, `${file}.opencode-dev.bak`);
    console.log(`Backed up ${file} -> ${file}.opencode-dev.bak`);
  } catch {}
}
