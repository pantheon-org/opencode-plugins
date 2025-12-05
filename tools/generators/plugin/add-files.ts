import * as path from 'path';

import { Tree, names, offsetFromRoot, generateFiles } from '@nx/devkit';

import { astroDependencies, astroDevDependencies } from './dependencies';
import { getFlattenedActions } from './github-actions-versions';
import { NormalizedOptions } from './normalize-options';

/**
 * Recursively collects all file paths in a directory from the Nx Tree.
 * @param tree - Nx virtual file system
 * @param dirPath - Directory path to collect files from
 * @param files - Map to store file paths and their content
 */
const collectFilesFromTree = (tree: Tree, dirPath: string, files: Map<string, Buffer>): void => {
  try {
    if (!tree.exists(dirPath)) {
      return;
    }

    const entries = tree.children(dirPath);
    entries.forEach((entry) => {
      const fullPath = path.join(dirPath, entry);
      if (tree.isFile(fullPath)) {
        const content = tree.read(fullPath);
        if (content) {
          files.set(fullPath, content);
        }
      } else {
        collectFilesFromTree(tree, fullPath, files);
      }
    });
  } catch (e) {
    // Directory might not exist or be readable
    console.warn(`Warning: Could not read directory ${dirPath}:`, e);
  }
};

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
    astroDependencies,
    astroDevDependencies,
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
