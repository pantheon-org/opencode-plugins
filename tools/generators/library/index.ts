import { formatFiles, generateFiles, names, Tree, addProjectConfiguration, updateJson } from '@nx/devkit';
import * as path from 'path';
import { LibraryGeneratorSchema } from './schema';

export default async function (tree: Tree, options: LibraryGeneratorSchema) {
  const directory = options.directory || 'internal';
  const projectRoot = `${directory}/${options.name}`;
  const projectName = options.name;

  // Add project configuration
  addProjectConfiguration(tree, projectName, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    tags: ['type:lib', 'scope:internal'],
    targets: {
      build: {
        executor: '@nx/esbuild:esbuild',
        outputs: ['{options.outputPath}'],
        options: {
          platform: 'node',
          outputPath: `dist/${projectRoot}`,
          format: ['cjs'],
          bundle: false,
          main: `${projectRoot}/src/index.ts`,
          tsConfig: `${projectRoot}/tsconfig.lib.json`,
          assets: [`${projectRoot}/src/assets`],
          generatePackageJson: false,
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
    tmpl: '',
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

  return () => {
    console.log(`✅ Internal library '${projectName}' created in ${projectRoot}/`);
    console.log(`   This library is NOT mirrored or published to npm.`);
    console.log(`   Run: nx build ${projectName}`);
  };
}
