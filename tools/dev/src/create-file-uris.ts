import fs from 'node:fs';
import path from 'node:path';

export function createFileUris(links: string[]): string[] {
  return links.map((lp) => {
    const indexJs = path.join(lp, 'index.js');
    return fs.existsSync(indexJs) ? `file://${indexJs}` : `file://${lp}`;
  });
}
