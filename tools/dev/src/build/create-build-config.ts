import path from 'node:path';
import { resolvePluginDir } from '../fs/resolve-plugin-dir';
import type { BuildConfig } from '../types';

export function createBuildConfig(workspaceRoot: string, spec: string): BuildConfig {
  const dir = resolvePluginDir(workspaceRoot, spec);
  if (!dir) {
    console.error('Could not resolve plugin:', spec);
    process.exit(1);
  }
  return {
    dir,
    distPath: path.join(dir, 'dist'),
    projectName: path.basename(dir),
  };
}