#!/usr/bin/env bun

import { $ } from 'bun';
import { writeFile } from 'node:fs/promises';
import type { ChangeDetection } from './types';

/**
 * Detect changes in a package directory since the last version tag
 */
export async function detectChanges(packageName: string, packageDir: string): Promise<ChangeDetection> {
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
  } catch (error) {
    // If git command fails, assume changes exist (safe default)
    return {
      hasChanges: true,
      previousTag: undefined,
    };
  }
}

/**
 * Set GitHub Actions output
 */
async function setOutput(name: string, value: string): Promise<void> {
  const githubOutput = process.env.GITHUB_OUTPUT;
  if (!githubOutput) {
    console.log(`${name}=${value}`);
    return;
  }

  await writeFile(githubOutput, `${name}=${value}\n`, {
    flag: 'a',
    encoding: 'utf-8',
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
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
      console.log(`ℹ️  No previous tag found - this is the first release for ${packageName}`);
      await setOutput('has-changes', 'true');
      return;
    }

    console.log(`🔍 Comparing with previous tag: ${result.previousTag}`);

    if (result.hasChanges && result.changes) {
      console.log(`✅ Changes detected in ${packageDir} since ${result.previousTag}:`);

      // Show first 20 changes
      const displayChanges = result.changes.slice(0, 20);
      for (const change of displayChanges) {
        console.log(`   ${change}`);
      }

      if (result.changes.length > 20) {
        console.log(`   ... and ${result.changes.length - 20} more files`);
      }

      await setOutput('has-changes', 'true');
    } else {
      console.log(`⚠️  No changes detected in ${packageDir} since ${result.previousTag}`);
      console.log('   Skipping mirror sync to avoid unnecessary deployment');
      await setOutput('has-changes', 'false');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to detect changes:', message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
