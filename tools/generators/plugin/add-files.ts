import * as path from 'path';

import { Tree, names, offsetFromRoot, generateFiles } from '@nx/devkit';

import { NormalizedOptions } from './normalize-options';

export const addFiles = (tree: Tree, options: NormalizedOptions): void => {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    npmScope: 'pantheon-org',
  };

  generateFiles(tree, path.join(__dirname, 'files'), options.projectRoot, templateOptions);
};
