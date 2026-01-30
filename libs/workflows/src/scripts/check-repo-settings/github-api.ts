/**
 * GitHub API wrapper for repository settings checks
 */

import { Octokit } from '@octokit/rest';

import { withRetry } from '../../utils/retry';

import type { RepositoryData } from './types';

/**
 * Fetch repository data from GitHub API
 * @param octokit - Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Repository data
 */
export const fetchRepositoryData = async (octokit: Octokit, owner: string, repo: string): Promise<RepositoryData> => {
  const response = await withRetry(() => octokit.rest.repos.get({ owner, repo }));

  return {
    defaultBranch: response.data.default_branch,
    deleteBranchOnMerge: response.data.delete_branch_on_merge === true,
  };
};

/**
 * Check if branch protection is enabled on main branch
 * @param octokit - Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name to check (default: 'main')
 * @returns True if protection is enabled
 */
export const checkBranchProtectionEnabled = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = 'main',
): Promise<boolean> => {
  try {
    await withRetry(() =>
      octokit.rest.repos.getBranchProtection({
        owner,
        repo,
        branch,
      }),
    );
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint: Error type varies by caller
  } catch (error: any) {
    // 404 means no protection rules exist
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Create an Octokit instance
 * @param token - GitHub token
 * @returns Configured Octokit instance
 */
export const createOctokit = (token: string): Octokit => {
  return new Octokit({ auth: token });
};
