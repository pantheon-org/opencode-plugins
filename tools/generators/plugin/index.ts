import { Tree, formatFiles } from '@nx/devkit';

import { normalizeOptions } from './normalize-options';
import type { PluginGeneratorSchema } from './schema';
import { addFiles } from './src/add-files';
import { checkUpdate } from './src/check-update';
import { updateTsconfigPaths } from './update-ts-config-paths';

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
      console.log(`
✅ Successfully updated plugin: ${normalizedOptions.projectName}

Updated files:
  • Configuration files (package.json, tsconfig.json, etc.)
  • GitHub workflows (.github/workflows/*)
  • Documentation site (pages/*)

Preserved directories:
  • src/ - Your plugin source code
  • docs/ - Your documentation files

Next steps:
  1. Review the changes:
     git diff ${normalizedOptions.projectRoot}

  2. Build the plugin:
     nx build ${normalizedOptions.projectName}

  3. Test the plugin:
     nx pack ${normalizedOptions.projectName}
`);
    } else {
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
  import { ${normalizedOptions.pluginName} } from '${normalizedOptions.packageName}'
`);
    }
  };
};

export default pluginGenerator;
