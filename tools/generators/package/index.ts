import * as path from 'node:path';
import { addProjectConfiguration, formatFiles, generateFiles, names, type Tree, updateJson } from '@nx/devkit';
import type { PackageGeneratorSchema } from './schema';

export default async function (tree: Tree, options: PackageGeneratorSchema) {
  const directory = options.directory || 'packages';
  const projectRoot = `${directory}/${options.name}`;
  const projectName = options.name;

  // Add project configuration
  addProjectConfiguration(tree, projectName, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    tags: ['type:package'],
    targets: {
      build: {
        executor: '@nx/esbuild:esbuild',
        outputs: ['{options.outputPath}'],
        options: {
          platform: 'node',
          outputPath: `dist/${projectRoot}`,
          format: ['esm', 'cjs'],
          bundle: false,
          main: `${projectRoot}/src/index.ts`,
          tsConfig: `${projectRoot}/tsconfig.lib.json`,
          assets: [`${projectRoot}/README.md`, `${projectRoot}/LICENSE`],
          generatePackageJson: true,
          esbuildOptions: {
            sourcemap: true,
            outExtension: {
              '.js': '.js',
            },
          },
        },
      },
    },
  });

  // Generate files from templates
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    ...names(options.name),
    mirrorRepo: options.mirrorRepo,
    tmpl: '',
  });

  // Update package.json with repository URL
  updateJson(tree, `${projectRoot}/package.json`, (json) => {
    json.repository = {
      type: 'git',
      url: options.mirrorRepo,
    };
    return json;
  });

  // Add linting if requested
  if (options.addLint !== false) {
    const projectConfigContent = tree.read(`${projectRoot}/project.json`, 'utf-8');
    if (projectConfigContent) {
      const config = JSON.parse(projectConfigContent);
      config.targets.lint = {
        executor: '@nx/eslint:lint',
        options: {
          lintFilePatterns: [`${projectRoot}/**/*.ts`],
        },
      };
      tree.write(`${projectRoot}/project.json`, JSON.stringify(config, null, 2));
    }
  }

  // Update tsconfig paths
  updateJson(tree, 'tsconfig.base.json', (json) => {
    const npmScope = '@pantheon-org';
    json.compilerOptions.paths[`${npmScope}/${projectName}`] = [`${projectRoot}/src/index.ts`];
    return json;
  });

  await formatFiles(tree);

  return () => {};
}
