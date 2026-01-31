import fs from 'node:fs';

export async function waitForDist(distPath: string, maxWait = 30000): Promise<boolean> {
  const start = Date.now();
  while (!fs.existsSync(distPath)) {
    if (Date.now() - start > maxWait) return false;
    await new Promise((r) => setTimeout(r, 300));
  }
  return true;
}