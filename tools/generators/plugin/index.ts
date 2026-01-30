import { formatFiles, type Tree } from '@nx/devkit';

import type { PluginGeneratorSchema } from './schema';
import { addFiles } from './src/add-files';
import { checkUpdate } from './src/check-update';
import { normalizeOptions } from './src/normalize-options';
import { updateTsconfigPaths } from './src/update-ts-config-paths';

const pluginGenerator = async (tree: Tree, options: PluginGeneratorSchema): Promise<() => void> => {
  const normalizedOptions = normalizeOptions(tree, options);

  // Check if plugin already exists and validate regenerate flag
  const isUpdate = checkUpdate(tree, options, normalizedOptions);

  addFiles(tree, normalizedOptions);

  // Add TypeScript path mapping for Nx-style imports
  updateTsconfigPaths(tree, normalizedOptions.packageName, normalizedOptions.projectRoot);

  await formatFiles(tree);

  return () => {
    if (isUpdate) {
    } else {
    }
  };
};

export default pluginGenerator;
