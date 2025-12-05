import { Tree, names } from '@nx/devkit';

import { dependencies, devDependencies, PluginDependencies } from './dependencies';
import { PluginGeneratorSchema } from './schema';

export interface NormalizedOptions extends PluginGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  pluginName: string;
  packageName: string;
  devDependencies: PluginDependencies;
  dependencies: PluginDependencies;
}

const pascalCase = (str: string): string => {
  return str.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());
};

export const normalizeOptions = (tree: Tree, options: PluginGeneratorSchema): NormalizedOptions => {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory || 'packages';

  // Build project name with opencode- prefix and -plugin suffix
  let projectName = name;

  // Add opencode- prefix if not present
  if (!projectName.startsWith('opencode-')) {
    projectName = `opencode-${projectName}`;
  }

  // Add -plugin suffix if not present
  if (!projectName.endsWith('-plugin')) {
    projectName = `${projectName}-plugin`;
  }

  const projectRoot = `${projectDirectory}/${projectName}`;
  const parsedTags: string[] = [];
  const pluginName = pascalCase(projectName);
  const packageName = `@pantheon-org/${projectName}`;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    pluginName,
    packageName,
    devDependencies: devDependencies(),
    dependencies: dependencies,
  };
};
