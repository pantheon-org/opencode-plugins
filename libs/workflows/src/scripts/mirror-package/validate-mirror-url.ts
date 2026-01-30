#!/usr/bin/env bun

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import type { MirrorUrl } from './types';

/**
 * Extract and validate mirror repository URL from package.json
 */
export const validateMirrorUrl = async (packageJsonPath: string): Promise<MirrorUrl> => {
  if (!existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at ${packageJsonPath}`);
  }

  const content = await readFile(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(content);

  // Extract repository URL
  const repoUrl = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url || '';

  if (!repoUrl) {
    throw new Error(
      `No repository URL found in ${packageJsonPath}\n` +
        `   Add a 'repository' field like:\n` +
        `   "repository": {"type": "git", "url": "git+https://github.com/org/repo.git"}`,
    );
  }

  // Convert git+https://github.com/org/repo.git to https://github.com/org/repo
  const cleanUrl = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '');

  // Extract owner and repo from URL
  const match = cleanUrl.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub repository URL: ${cleanUrl}. Expected format: https://github.com/owner/repo`);
  }

  return {
    url: cleanUrl,
    owner: match[1],
    repo: match[2],
  };
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
  const packageJsonPath = process.argv[2];

  if (!packageJsonPath) {
    console.error('❌ No package.json path provided');
    console.error('Usage: bun run validate-mirror-url.ts <package.json path>');
    process.exit(1);
  }

  try {
    const mirrorUrl = await validateMirrorUrl(packageJsonPath);

    // Set GitHub Actions outputs
    await setOutput('url', mirrorUrl.url);
    await setOutput('owner', mirrorUrl.owner);
    await setOutput('repo', mirrorUrl.repo);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌', message);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}
