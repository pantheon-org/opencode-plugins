#!/usr/bin/env bun

import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

import type { PackageInfo } from './types';

/**
 * Parse a git tag to extract package information
 * Format: `<package-name>\@v<version>`
 * Example: `opencode-my-plugin\@v1.0.0`
 */
export const parseTag = (tag: string): PackageInfo => {
  // Remove refs/tags/ prefix if present
  const cleanTag = tag.replace(/^refs\/tags\//, '');

  // Split by @v to get package name and version
  const atIndex = cleanTag.lastIndexOf('@v');

  if (atIndex === -1) {
    throw new Error(`Invalid tag format: ${tag}. Expected format: <package-name>@v<version>`);
  }

  const name = cleanTag.substring(0, atIndex);
  const version = cleanTag.substring(atIndex + 1); // Include the 'v'

  if (!name || !version || version === 'v') {
    throw new Error(`Invalid tag format: ${tag}. Could not parse package name or version.`);
  }

  return {
    name,
    version,
    directory: `packages/${name}`,
  };
};

/**
 * Set GitHub Actions output
 */
export const setOutput = async (name: string, value: string): Promise<void> => {
  const githubOutput = process.env.GITHUB_OUTPUT;
  if (!githubOutput) {
    console.log(`${name}=${value}`);
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
  const tag = process.env.GITHUB_REF || process.argv[2];

  if (!tag) {
    console.error('❌ No tag provided');
    console.error('Usage: bun run parse-tag.ts <tag>');
    console.error('   or: Set GITHUB_REF environment variable');
    process.exit(1);
  }

  try {
    const packageInfo = parseTag(tag);

    // Output for humans
    console.log(`📦 Package: ${packageInfo.name}`);
    console.log(`📂 Directory: ${packageInfo.directory}`);
    console.log(`🏷️  Version: ${packageInfo.version}`);

    // Set GitHub Actions outputs
    await setOutput('package', packageInfo.name);
    await setOutput('dir', packageInfo.directory);
    await setOutput('version', packageInfo.version);

    // Check if package directory exists
    const dirExists = existsSync(packageInfo.directory);
    if (!dirExists) {
      console.error(`❌ Package directory ${packageInfo.directory} does not exist`);
      process.exit(1);
    }

    console.log(`✅ Package directory exists`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to parse tag:', message);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}
