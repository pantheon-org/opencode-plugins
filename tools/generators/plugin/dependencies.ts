import * as fs from 'fs';

export interface PluginDependencies {
  [packageName: string]: string;
}

export const devDependencies = (): PluginDependencies => {
  const packageJson: string = fs.readFileSync('./package.json', 'utf-8');

  const baseProjectPackageJson = JSON.parse(packageJson).devDependencies;

  const nxDependencies: string[] = [
    '@eslint/js',
    '@nx/devkit',
    '@nx/eslint',
    '@nx/eslint-plugin',
    '@nx/node',
    '@nx/plugin',
    '@swc-node/register',
    '@swc/core',
    'nx',
    'lefthook',
    'tsup',
  ];

  // Filter out Nx-specific dependencies from the base project's devDependencies
  return Object.keys(baseProjectPackageJson).reduce((deps: PluginDependencies, depName: string) => {
    if (!nxDependencies.includes(depName)) {
      deps[depName] = baseProjectPackageJson[depName];
    }
    return deps;
  }, {});
};

export const dependencies: PluginDependencies = {
  csstype: '^3.1.3',
  'undici-types': '^7.16.0',
  zod: '^4.1.8',
};
