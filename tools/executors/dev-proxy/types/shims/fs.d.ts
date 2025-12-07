declare module 'fs' {
  const fs: any;
  export default fs;
  export function readFileSync(path: string, encoding?: string): string;
  export function existsSync(path: string): boolean;
}

declare module 'node:fs' {
  export * from 'fs';
}
