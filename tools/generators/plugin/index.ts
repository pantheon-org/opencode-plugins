import { Tree, formatFiles } from '@nx/devkit';

import { addFiles } from './add-files';
import { normalizeOptions } from './normalize-options';
import type { PluginGeneratorSchema } from './schema';
import { updateTsconfigPaths } from './update-ts-config-paths';

const pluginGenerator = async (tree: Tree, options: PluginGeneratorSchema): Promise<() => void> => {
  const normalizedOptions = normalizeOptions(tree, options);

  addFiles(tree, normalizedOptions);

  // Add TypeScript path mapping for Nx-style imports
  const packageName = `@pantheon-org/${normalizedOptions.projectName}`;
  updateTsconfigPaths(tree, packageName, normalizedOptions.projectRoot);

  await formatFiles(tree);

  return () => {
    console.log(`
✨ Successfully created plugin: ${normalizedOptions.projectName}

Next steps:
  1. Navigate to the plugin directory:
     cd ${normalizedOptions.projectRoot}

  2. Install dependencies:
     bun install

  3. Build the plugin:
     nx build ${normalizedOptions.projectName}

  4. Pack the plugin:
     nx pack ${normalizedOptions.projectName}

  5. Start developing your plugin in:
     ${normalizedOptions.projectRoot}/src/index.ts

The plugin can now be imported from other packages using:
  import { YourPlugin } from '${packageName}'
`);
  };
};

export default pluginGenerator;
