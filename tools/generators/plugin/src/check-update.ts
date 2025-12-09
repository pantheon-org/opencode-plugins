import { Tree } from '@nx/devkit';

import { NormalizedOptions } from '../normalize-options';
import { PluginGeneratorSchema } from '../schema';

/**
 * Checks if the plugin already exists and validates regenerate flag
 * @param tree - Nx virtual file system
 * @param options - Original generator options
 * @param normalizedOptions - Normalized options with computed paths
 * @returns true if this is an update operation, false if new plugin
 * @throws Error if plugin exists and regenerate flag is not set
 */
export const checkUpdate = (
  tree: Tree,
  options: PluginGeneratorSchema,
  normalizedOptions: NormalizedOptions,
): boolean => {
  const isUpdate = tree.exists(normalizedOptions.projectRoot);

  // If plugin exists and regenerate flag is not set, throw error
  if (isUpdate && !options.regenerate) {
    throw new Error(`
Plugin already exists at: ${normalizedOptions.projectRoot}

To regenerate this plugin and update configuration files (while preserving src/ and docs/), run:
  nx g ./tools/generators:plugin ${options.name} --regenerate

Or use the shorthand:
  nx g ./tools/generators:plugin ${options.name} -r

This will:
  ✓ Preserve src/ - Your plugin source code
  ✓ Preserve docs/ - Your documentation files
  ✗ Regenerate all configuration files (package.json, tsconfig.json, etc.)
  ✗ Regenerate GitHub workflows (.github/workflows/*)
  ✗ Regenerate documentation site (pages/*)
`);
  }

  return isUpdate;
};
