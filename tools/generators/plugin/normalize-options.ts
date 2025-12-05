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
  // Only add prefix "opencode-" if not already present
  const projectName = name.startsWith('opencode-') ? name : `opencode-${name}`;
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
