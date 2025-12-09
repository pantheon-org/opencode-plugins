import * as path from 'path';

import { Tree, names, offsetFromRoot, generateFiles } from '@nx/devkit';

import { dependencies, devDependencies } from '../dependencies';
import { getFlattenedActions } from '../github-action-versions/get-flattened-actions';
import { NormalizedOptions } from '../normalize-options';

import { collectFilesFromTree } from './collect-files-from-tree';

/**
 * Generates files for the plugin, preserving existing src/ and docs/ directories
 * while regenerating all other configuration files.
 */
export const addFiles = (tree: Tree, options: NormalizedOptions): void => {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    npmScope: 'pantheon-org',
    dependencies: dependencies,
    devDependencies: devDependencies(),
    actions: getFlattenedActions(),
  };

  const templatePath = path.join(__dirname, 'files');

  // Check if src/ and docs/ directories already exist
  const srcPath = path.join(options.projectRoot, 'src');
  const docsPath = path.join(options.projectRoot, 'docs');
  const srcExists = tree.exists(srcPath);
  const docsExists = tree.exists(docsPath);
  const shouldRegenerate = options.regenerate ?? true;

  if ((srcExists || docsExists) && shouldRegenerate) {
    // Plugin already exists - selective regeneration
    const preserved: string[] = [];
    if (srcExists) preserved.push('src/');
    if (docsExists) preserved.push('docs/');

    console.log(`\n⚠️  Existing plugin detected. Preserving ${preserved.join(' and ')} directories...`);

    // Store existing content before generation
    const existingContent: Map<string, Buffer> = new Map();

    if (srcExists) {
      collectFilesFromTree(tree, srcPath, existingContent);
    }

    if (docsExists) {
      collectFilesFromTree(tree, docsPath, existingContent);
    }

    // Clean up .github/ directory before regenerating
    const githubPath = path.join(options.projectRoot, '.github');
    if (tree.exists(githubPath)) {
      console.log('  ✓ Cleaning .github/ directory...');
      tree.delete(githubPath);
    }

    // Generate all files (including src/ and docs/)
    generateFiles(tree, templatePath, options.projectRoot, templateOptions);

    // Restore preserved files by overwriting the generated ones
    existingContent.forEach((content, filePath) => {
      tree.write(filePath, content);
    });

    console.log(`  ✓ Config files regenerated, ${preserved.join(' and ')} preserved\n`);
  } else {
    // New plugin - generate everything
    generateFiles(tree, templatePath, options.projectRoot, templateOptions);
  }
};
