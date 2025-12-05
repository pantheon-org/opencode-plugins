import { Tree, names } from '@nx/devkit';

import { devDependencies } from '../dependencies';
import { PluginGeneratorSchema } from './schema';
import { DevDependencies } from './dependencies';

export interface NormalizedOptions extends PluginGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  pluginName: string;
  devDependencies: DevDependencies;
}

const pascalCase = (str: string): string => {
  return str.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());
};

export const normalizeOptions = (tree: Tree, options: PluginGeneratorSchema): NormalizedOptions => {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory || 'packages';
  const projectName = `opencode-${name}-plugin`;
  const projectRoot = `${projectDirectory}/${projectName}`;
  const parsedTags: string[] = [];
  const pluginName = pascalCase(projectName);
  const devDependencies = devDependencies();

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    pluginName,
  };
};
