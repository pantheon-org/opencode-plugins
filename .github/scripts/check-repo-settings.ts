#!/usr/bin/env bun
/**
 * GitHub Repository Settings Checker
 *
 * This script validates repository settings to ensure:
 * 1. Default branch is 'main'
 * 2. Branch protection is enabled on 'main'
 * 3. Automatic branch deletion after merge is enabled
 *
 * The script is read-only and reports issues rather than fixing them.
 * Issues are automatically created/updated/closed based on check results.
 */

import { Octokit } from '@octokit/rest';

interface CheckResult {
  name: string;
  passed: boolean;
  current: string;
  expected: string;
  remediation?: string;
}

/**
 * Retry logic for transient API failures
 * Does not retry on 403 Forbidden (permanent permission issues)
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry on 403 Forbidden (permanent permission issue)
      if (i === maxRetries - 1 || error.status === 403) {
        throw error;
      }
      // Exponential backoff: 1s, 2s, 3s
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Unreachable');
}

/**
 * Generate markdown summary for GitHub Actions
 */
function generateSummary(results: CheckResult[], allPassed: boolean, issueAction?: string): string {
  let summary = `## ${allPassed ? '✅' : '⚠️'} Repository Settings Check${allPassed ? ' - All Passed' : ' - Issues Found'}\n\n`;

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    summary += `- ${icon} **${result.name}**: ${result.current}\n`;
    if (!result.passed && result.remediation) {
      summary += `  - Expected: ${result.expected}\n`;
      summary += `  - Action: ${result.remediation}\n`;
    }
  }

  summary += '\n';
  summary += allPassed
    ? 'Repository configuration complies with organizational standards.\n'
    : 'Please review and update repository settings.\n';

  if (issueAction) {
    summary += `\n${issueAction}\n`;
  }

  return summary;
}

/**
 * Generate issue body with failed checks
 */
function generateIssueBody(failedChecks: CheckResult[]): string {
  let body = '## ⚠️ Repository Settings Check Failed\n\n';
  body += 'The automated repository settings check has detected configuration issues that need attention.\n\n';
  body += '### Failed Checks\n\n';

  for (const check of failedChecks) {
    body += `- [ ] **${check.name}**\n`;
    body += `  - Current: ${check.current}\n`;
    body += `  - Expected: ${check.expected}\n`;
    body += `  - Action: ${check.remediation}\n\n`;
  }

  body += '### Next Steps\n\n';
  body += '1. Review the failed checks above\n';
  body += '2. Follow the remediation steps for each failed check\n';
  body += '3. This issue will automatically close when all checks pass\n\n';
  body += '---\n';
  body += `_This issue was automatically created by the repository settings check workflow._`;

  return body;
}

/**
 * Handle GitHub issue creation/update/closure
 */
async function handleIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  results: CheckResult[],
  allPassed: boolean,
): Promise<string> {
  const issueTitle = 'Repository Settings Check Failed';

  // Search for existing open issue
  const issuesResponse = await withRetry(() =>
    octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      labels: 'repository-settings',
      creator: 'github-actions[bot]',
    }),
  );

  const issues = issuesResponse.data;
  const existingIssue = issues.find((issue) => issue.title === issueTitle);

  if (allPassed) {
    // All checks passed - close issue if it exists
    if (existingIssue) {
      await withRetry(() =>
        octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: existingIssue.number,
          body: '✅ All repository settings checks are now passing. Closing this issue.',
        }),
      );

      await withRetry(() =>
        octokit.rest.issues.update({
          owner,
          repo,
          issue_number: existingIssue.number,
          state: 'closed',
        }),
      );

      return `Note: Closed issue #${existingIssue.number} as all checks are now passing.`;
    }
    return '';
  } else {
    // Some checks failed - create or update issue
    const failedChecks = results.filter((r) => !r.passed);
    const issueBody = generateIssueBody(failedChecks);

    if (existingIssue) {
      // Update existing issue
      await withRetry(() =>
        octokit.rest.issues.update({
          owner,
          repo,
          issue_number: existingIssue.number,
          body: issueBody,
        }),
      );

      await withRetry(() =>
        octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: existingIssue.number,
          body: `⚠️ Repository settings check ran on ${new Date().toISOString()} - issues still present.`,
        }),
      );

      return `Note: Updated existing issue #${existingIssue.number} with current findings.`;
    } else {
      // Create new issue
      const newIssueResponse = await withRetry(() =>
        octokit.rest.issues.create({
          owner,
          repo,
          title: issueTitle,
          body: issueBody,
          labels: ['chore', 'repository-settings'],
        }),
      );

      return `Note: Created issue #${newIssueResponse.data.number} to track these configuration issues.`;
    }
  }
}

/**
 * Main function to check repository settings
 */
async function checkRepositorySettings(): Promise<void> {
  // Validate environment variables
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;

  if (!token || !owner || !repo) {
    console.error('❌ Missing required environment variables: GITHUB_TOKEN, REPO_OWNER, REPO_NAME');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  try {
    // Fetch repository data
    const repoResponse = await withRetry(() => octokit.rest.repos.get({ owner, repo }));
    const repoData = repoResponse.data;

    // Check 1: Default branch
    const isMainDefault = repoData.default_branch === 'main';

    // Check 2: Branch protection
    let hasProtection = false;
    try {
      await withRetry(() =>
        octokit.rest.repos.getBranchProtection({
          owner,
          repo,
          branch: 'main',
        }),
      );
      hasProtection = true;
    } catch (error: any) {
      // 404 means no protection rules exist
      if (error.status !== 404) {
        throw error;
      }
    }

    // Check 3: Auto-delete branches
    const autoDelete = repoData.delete_branch_on_merge === true;

    // Structure results
    const results: CheckResult[] = [
      {
        name: 'Default branch',
        passed: isMainDefault,
        current: repoData.default_branch,
        expected: 'main',
        remediation: isMainDefault ? undefined : 'Go to Settings → Branches → Change default branch to main',
      },
      {
        name: 'Branch protection',
        passed: hasProtection,
        current: hasProtection ? 'Enabled' : 'No protection rules',
        expected: 'Protection enabled',
        remediation: hasProtection ? undefined : 'Go to Settings → Branches → Add rule for main',
      },
      {
        name: 'Automatic branch deletion',
        passed: autoDelete,
        current: autoDelete ? 'Enabled' : 'Disabled',
        expected: 'Enabled',
        remediation: autoDelete ? undefined : 'Go to Settings → General → Enable "Automatically delete head branches"',
      },
    ];

    // Determine if all checks passed
    const allPassed = results.every((r) => r.passed);

    // Handle GitHub issue creation/update/closure
    const issueAction = await handleIssue(octokit, owner, repo, results, allPassed);

    // Generate summary
    const summary = generateSummary(results, allPassed, issueAction);

    // Write to GITHUB_STEP_SUMMARY if in GitHub Actions
    if (process.env.GITHUB_STEP_SUMMARY) {
      await Bun.write(process.env.GITHUB_STEP_SUMMARY, summary);
    }

    // Always log to console for local testing
    console.log(summary);

    // Exit 0 even if checks fail (informational only)
    // Script errors (caught by catch block) will exit 1
    process.exit(0);
  } catch (error: any) {
    // Handle script errors (API failures, network issues, permission problems)
    console.error('❌ Script error:', error.message);
    if (error.status === 403) {
      console.error('Permission denied. Ensure GITHUB_TOKEN has read permissions for repository settings.');
    }
    // Exit 1 for script errors
    process.exit(1);
  }
}

// Main execution
checkRepositorySettings().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
