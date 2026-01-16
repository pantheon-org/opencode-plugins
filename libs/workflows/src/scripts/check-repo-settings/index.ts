#!/usr/bin/env node
/**
 * GitHub Repository Settings Checker - CLI Entry Point
 *
 * This script validates repository settings to ensure:
 * 1. Default branch is 'main'
 * 2. Branch protection is enabled on 'main'
 * 3. Automatic branch deletion after merge is enabled
 *
 * The script is read-only and reports issues rather than fixing them.
 * Issues are automatically created/updated/closed based on check results.
 */

import { generateSummary, writeSummaryToFile } from '../../utils/github-summary';

import { runAllChecks, allChecksPassed } from './checks';
import { createOctokit, fetchRepositoryData, checkBranchProtectionEnabled } from './github-api';
import { handleIssue } from './issue-manager';

/**
 * Validate required environment variables
 * @returns Object containing token, owner, and repo
 * @throws Exits process if required variables are missing
 */
const validateEnvironment = (): {
  token: string;
  owner: string;
  repo: string;
} => {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;

  if (!token || !owner || !repo) {
    console.error('❌ Missing required environment variables: GITHUB_TOKEN, REPO_OWNER, REPO_NAME');
    process.exit(1);
  }

  return { token, owner, repo };
};

/**
 * Main function to check repository settings
 */
const checkRepositorySettings = async (): Promise<void> => {
  try {
    // Validate environment variables
    const { token, owner, repo } = validateEnvironment();

    // Create GitHub API client
    const octokit = createOctokit(token);

    // Fetch repository data
    const repoData = await fetchRepositoryData(octokit, owner, repo);

    // Check branch protection
    const hasProtection = await checkBranchProtectionEnabled(octokit, owner, repo);

    // Run all checks
    const results = runAllChecks(repoData, hasProtection);
    const allPassed = allChecksPassed(results);

    // Handle GitHub issue creation/update/closure
    const issueAction = await handleIssue(octokit, owner, repo, results, allPassed);

    // Generate summary
    const summary = generateSummary(results, allPassed, issueAction);

    // Write to GITHUB_STEP_SUMMARY if in GitHub Actions
    await writeSummaryToFile(summary);

    // Always log to console for local testing
    console.log(summary);

    // Exit 0 even if checks fail (informational only)
    // Script errors (caught by catch block) will exit 1
    process.exit(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle script errors (API failures, network issues, permission problems)
    console.error('❌ Script error:', error.message);
    if (error.status === 403) {
      console.error('Permission denied. Ensure GITHUB_TOKEN has read permissions for repository settings.');
    }
    // Exit 1 for script errors
    process.exit(1);
  }
};

// Main execution
checkRepositorySettings().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
