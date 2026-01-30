import * as fs from 'node:fs';

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

export const astroDependencies: PluginDependencies = {
  '@astrojs/check': '^0.9.0',
  '@astrojs/starlight': '^0.36.0',
  '@types/figlet': '^1.7.0',
  astro: '^5.15.0',
  'astro-diagram': '^0.7.0',
  'astro-expressive-code': '^0.38.0',
  figlet: '^1.9.4',
  mermaid: '^11.12.1',
  playwright: '^1.56.1',
  'rehype-mermaid': '^3.0.0',
  sharp: '^0.34.5',
};

export const astroDevDependencies: PluginDependencies = {
  '@types/node': '^20.0.0',
  typescript: '^5.0.0',
};
