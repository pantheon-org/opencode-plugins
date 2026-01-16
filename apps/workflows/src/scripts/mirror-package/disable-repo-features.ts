#!/usr/bin/env bun

import { Octokit } from '@octokit/rest';

import { withRetry } from '../../utils/retry';

import type { DisableFeaturesResult } from './types';

/**
 * Create an Octokit instance
 */
const createOctokit = (token: string): Octokit => {
  return new Octokit({ auth: token });
};

/**
 * Disable repository features (Issues, Projects, Wiki, Downloads)
 *
 * Mirror repositories should be read-only and only serve as distribution
 * channels. All development happens in the monorepo, so these features
 * should be disabled to avoid confusion and ensure single source of truth.
 *
 * @see https://docs.github.com/en/rest/repos/repos#update-a-repository
 */
export const disableRepoFeatures = async (
  owner: string,
  repo: string,
  token: string,
): Promise<DisableFeaturesResult> => {
  const octokit = createOctokit(token);

  // Disable all interactive features
  const updateConfig = {
    owner,
    repo,
    has_issues: false, // Disable Issues
    has_projects: false, // Disable Projects
    has_wiki: false, // Disable Wiki
    has_downloads: false, // Disable Downloads (deprecated, but still disable)
  };

  try {
    await withRetry(() => octokit.rest.repos.update(updateConfig));

    return {
      success: true,
      status: 'disabled',
      message: 'Repository features (Issues, Projects, Wiki) disabled successfully',
      disabledFeatures: ['issues', 'projects', 'wiki', 'downloads'],
      httpCode: 200,
    };
  } catch (error: unknown) {
    const octokitError = error as { status?: number; message?: string };

    return {
      success: false,
      status: 'failed',
      message: `Failed to disable repository features: ${octokitError.message || 'Unknown error'}`,
      disabledFeatures: [],
      httpCode: octokitError.status,
    };
  }
};

/**
 * Main entry point
 */
const main = async (): Promise<void> => {
  const owner = process.argv[2];
  const repo = process.argv[3];
  const token = process.env.MIRROR_REPO_TOKEN || process.argv[4];

  if (!owner || !repo) {
    console.error('❌ Missing required arguments');
    console.error('Usage: bun run disable-repo-features.ts <owner> <repo> [token]');
    console.error('   or: Set MIRROR_REPO_TOKEN environment variable');
    process.exit(1);
  }

  if (!token) {
    console.error('❌ No GitHub token provided');
    console.error('Set MIRROR_REPO_TOKEN environment variable or pass as 4th argument');
    process.exit(1);
  }

  console.log(`🔒 Disabling repository features for ${owner}/${repo}...`);

  const result = await disableRepoFeatures(owner, repo, token);

  if (result.success) {
    console.log(`✅ ${result.message}`);
    console.log(`   Disabled features: ${result.disabledFeatures.join(', ')}`);
    console.log(`   Users cannot create issues, projects, or edit wiki`);
    console.log(`   All development happens in the monorepo`);
  } else {
    console.error(`⚠️  Warning: ${result.message}`);
    if (result.httpCode) {
      console.error(`   HTTP Status: ${result.httpCode}`);
    }
    // Non-blocking: warn but don't exit with error
    process.exit(0);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}
