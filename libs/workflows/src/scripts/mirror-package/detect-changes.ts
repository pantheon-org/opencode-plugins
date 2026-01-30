#!/usr/bin/env bun

import { writeFile } from 'node:fs/promises';

import { $ } from 'bun';

import type { ChangeDetection } from './types';

/**
 * Detect changes in a package directory since the last version tag
 */
export const detectChanges = async (packageName: string, packageDir: string): Promise<ChangeDetection> => {
  // Get the previous tag for this package
  const tagPattern = `${packageName}@v*`;

  try {
    const tagList = await $`git tag -l ${tagPattern} --sort=-version:refname`.text();
    const tags = tagList.trim().split('\n').filter(Boolean);

    if (tags.length < 2) {
      // No previous tag or only one tag exists
      return {
        hasChanges: true,
        previousTag: undefined,
      };
    }

    const previousTag = tags[1]; // Second most recent tag

    // Check if any files changed in package directory since last tag
    const diffOutput = await $`git diff --name-only ${previousTag} HEAD -- ${packageDir}`.text();
    const changes = diffOutput.trim().split('\n').filter(Boolean);

    return {
      hasChanges: changes.length > 0,
      previousTag,
      changes,
    };
  } catch {
    // If git command fails, assume changes exist (safe default)
    return {
      hasChanges: true,
      previousTag: undefined,
    };
  }
};

/**
 * Set GitHub Actions output
 */
const setOutput = async (name: string, value: string): Promise<void> => {
  const githubOutput = process.env.GITHUB_OUTPUT;
  if (!githubOutput) {
    return;
  }

  await writeFile(githubOutput, `${name}=${value}\n`, {
    flag: 'a',
    encoding: 'utf-8',
  });
};

/**
 * Main entry point
 */
const main = async (): Promise<void> => {
  const packageName = process.argv[2];
  const packageDir = process.argv[3];

  if (!packageName || !packageDir) {
    console.error('❌ Missing required arguments');
    console.error('Usage: bun run detect-changes.ts <package-name> <package-dir>');
    process.exit(1);
  }

  try {
    const result = await detectChanges(packageName, packageDir);

    if (!result.previousTag) {
      await setOutput('has-changes', 'true');
      return;
    }

    if (result.hasChanges && result.changes) {
      // Show first 20 changes
      const displayChanges = result.changes.slice(0, 20);
      for (const _change of displayChanges) {
      }

      if (result.changes.length > 20) {
      }

      await setOutput('has-changes', 'true');
    } else {
      await setOutput('has-changes', 'false');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to detect changes:', message);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}
