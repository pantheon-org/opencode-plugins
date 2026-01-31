import path from 'node:path';
import { isDir } from './is-dir';

export const resolvePluginDir = (workspaceRoot: string, spec: string): string | null => {
  const asPath = path.resolve(workspaceRoot, spec);
  if (isDir(asPath)) return asPath;
  const candidate1 = path.join(workspaceRoot, 'packages', spec);
  if (isDir(candidate1)) return candidate1;
  const candidate2 = path.join(workspaceRoot, 'packages', `opencode-${spec}`);
  if (isDir(candidate2)) return candidate2;
  return null;
};
