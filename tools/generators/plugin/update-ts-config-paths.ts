import { type Tree, updateJson } from '@nx/devkit';

export const updateTsconfigPaths = (tree: Tree, packageName: string, projectRoot: string): void => {
  updateJson(tree, 'tsconfig.base.json', (json) => {
    if (!json.compilerOptions) {
      json.compilerOptions = {};
    }
    if (!json.compilerOptions.paths) {
      json.compilerOptions.paths = {};
    }

    json.compilerOptions.paths[packageName] = [`${projectRoot}/src/index.ts`];

    return json;
  });
};
