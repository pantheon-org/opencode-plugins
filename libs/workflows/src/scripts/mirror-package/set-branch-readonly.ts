#!/usr/bin/env bun

import { Octokit } from '@octokit/rest';

import { withRetry } from '../../utils/retry';

import type { BranchProtectionResult } from './types';

/**
 * Create an Octokit instance
 */
const createOctokit = (token: string): Octokit => {
  return new Octokit({ auth: token });
};

/**
 * Set branch protection to make a branch read-only
 *
 * This uses GitHub's branch protection API with `lock_branch: true` which prevents
 * users from pushing to the branch. The only way to update the branch is through
 * force push with the MIRROR_REPO_TOKEN (from the monorepo workflow).
 *
 * @see https://docs.github.com/en/rest/branches/branch-protection#update-branch-protection
 */
export const setBranchReadonly = async (
  owner: string,
  repo: string,
  branch: string,
  token: string,
): Promise<BranchProtectionResult> => {
  const octokit = createOctokit(token);

  // Minimal branch protection config that makes branch read-only
  const protectionConfig = {
    owner,
    repo,
    branch,
    // Disable most protections but enable lock_branch
    required_status_checks: null,
    enforce_admins: false,
    required_pull_request_reviews: null,
    restrictions: null,
    // Make the branch read-only
    lock_branch: true,
    // Allow force pushes from authorized token (monorepo workflow)
    allow_force_pushes: true,
  };

  try {
    await withRetry(() => octokit.rest.repos.updateBranchProtection(protectionConfig));

    return {
      success: true,
      status: 'protected',
      message: `Branch ${branch} is now read-only`,
      httpCode: 200,
    };
  } catch (error: unknown) {
    const octokitError = error as { status?: number; message?: string };

    return {
      success: false,
      status: 'failed',
      message: `Failed to set branch protection: ${octokitError.message || 'Unknown error'}`,
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
  const branch = process.argv[4] || 'main';
  const token = process.env.MIRROR_REPO_TOKEN || process.argv[5];

  if (!owner || !repo) {
    console.error('❌ Missing required arguments');
    console.error('Usage: bun run set-branch-readonly.ts <owner> <repo> [branch] [token]');
    console.error('   branch defaults to "main"');
    console.error('   or: Set MIRROR_REPO_TOKEN environment variable');
    process.exit(1);
  }

  if (!token) {
    console.error('❌ No GitHub token provided');
    console.error('Set MIRROR_REPO_TOKEN environment variable or pass as 4th/5th argument');
    process.exit(1);
  }

  const result = await setBranchReadonly(owner, repo, branch, token);

  if (result.success) {
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
