#!/usr/bin/env bun

import { Octokit } from '@octokit/rest';

import { withRetry } from '../../utils/retry';

import type { EnablePagesResult } from './types';

/**
 * Create an Octokit instance
 */
const createOctokit = (token: string): Octokit => {
  return new Octokit({ auth: token });
};

/**
 * Enable or update GitHub Pages configuration for a repository
 */
export const enableGitHubPages = async (owner: string, repo: string, token: string): Promise<EnablePagesResult> => {
  const octokit = createOctokit(token);

  const pagesConfig = {
    owner,
    repo,
    build_type: 'workflow' as const,
    source: {
      branch: 'main',
      path: '/' as const,
    },
  };

  try {
    // Try to create GitHub Pages site
    await withRetry(() => octokit.rest.repos.createPagesSite(pagesConfig));

    return {
      success: true,
      status: 'created',
      message: 'GitHub Pages enabled successfully',
      httpCode: 201,
    };
  } catch (error: unknown) {
    // Check if error is Octokit error with status
    const octokitError = error as { status?: number; message?: string };

    // If Pages already exists (409), try to update
    if (octokitError.status === 409) {
      try {
        await withRetry(() => octokit.rest.repos.updateInformationAboutPagesSite(pagesConfig));

        return {
          success: true,
          status: 'updated',
          message: 'GitHub Pages configuration updated successfully',
          httpCode: 204,
        };
      } catch (updateError: unknown) {
        const updateOctokitError = updateError as {
          status?: number;
          message?: string;
        };
        return {
          success: false,
          status: 'failed',
          message: `Failed to update GitHub Pages: ${updateOctokitError.message || 'Unknown error'}`,
          httpCode: updateOctokitError.status,
        };
      }
    }

    // Other errors
    return {
      success: false,
      status: 'failed',
      message: `Failed to enable GitHub Pages: ${octokitError.message || 'Unknown error'}`,
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
    console.error('Usage: bun run enable-github-pages.ts <owner> <repo> [token]');
    console.error('   or: Set MIRROR_REPO_TOKEN environment variable');
    process.exit(1);
  }

  if (!token) {
    console.error('❌ No GitHub token provided');
    console.error('Set MIRROR_REPO_TOKEN environment variable or pass as 3rd argument');
    process.exit(1);
  }

  console.log(`📄 Enabling GitHub Pages for ${owner}/${repo}...`);

  const result = await enableGitHubPages(owner, repo, token);

  if (result.success) {
    console.log(`✅ ${result.message}`);
    if (result.status === 'updated') {
      console.log(`ℹ️  GitHub Pages already existed, configuration updated`);
    }
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
