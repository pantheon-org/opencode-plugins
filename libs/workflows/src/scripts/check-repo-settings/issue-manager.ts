/**
 * GitHub issue manager for repository settings issues
 */

import type { Octokit } from '@octokit/rest';

import { withRetry } from '../../utils/retry';

import type { CheckResult } from './types';

const ISSUE_TITLE = 'Repository Settings Check Failed';
const ISSUE_LABELS = ['chore', 'repository-settings'];

/**
 * Generate issue body with failed checks
 * @param failedChecks - Array of failed check results
 * @returns Markdown-formatted issue body
 */
export const generateIssueBody = (failedChecks: CheckResult[]): string => {
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
};

/**
 * Find existing open issue
 * @param octokit - Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Issue number if found, null otherwise
 */
const findExistingIssue = async (octokit: Octokit, owner: string, repo: string): Promise<number | null> => {
  const response = await withRetry(() =>
    octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      labels: 'repository-settings',
      creator: 'github-actions[bot]',
    }),
  );

  const issue = response.data.find((i) => i.title === ISSUE_TITLE);
  return issue ? issue.number : null;
};

/**
 * Create a new issue
 * @param octokit - Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param body - Issue body content
 * @returns Created issue number
 */
const createIssue = async (octokit: Octokit, owner: string, repo: string, body: string): Promise<number> => {
  const response = await withRetry(() =>
    octokit.rest.issues.create({
      owner,
      repo,
      title: ISSUE_TITLE,
      body,
      labels: ISSUE_LABELS,
    }),
  );

  return response.data.number;
};

/**
 * Update existing issue
 * @param octokit - Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param issueNumber - Issue number to update
 * @param body - Updated issue body
 */
const updateIssue = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
): Promise<void> => {
  await withRetry(() =>
    octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    }),
  );

  await withRetry(() =>
    octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: `⚠️ Repository settings check ran on ${new Date().toISOString()} - issues still present.`,
    }),
  );
};

/**
 * Close existing issue
 * @param octokit - Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param issueNumber - Issue number to close
 */
const closeIssue = async (octokit: Octokit, owner: string, repo: string, issueNumber: number): Promise<void> => {
  await withRetry(() =>
    octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: '✅ All repository settings checks are now passing. Closing this issue.',
    }),
  );

  await withRetry(() =>
    octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'closed',
    }),
  );
};

/**
 * Handle GitHub issue creation/update/closure
 * @param octokit - Octokit instance
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param results - Array of check results
 * @param allPassed - Whether all checks passed
 * @returns Status message describing action taken
 */
export const handleIssue = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  results: CheckResult[],
  allPassed: boolean,
): Promise<string> => {
  const existingIssueNumber = await findExistingIssue(octokit, owner, repo);

  if (allPassed) {
    // All checks passed - close issue if it exists
    if (existingIssueNumber) {
      await closeIssue(octokit, owner, repo, existingIssueNumber);
      return `Note: Closed issue #${existingIssueNumber} as all checks are now passing.`;
    }
    return '';
  } else {
    // Some checks failed - create or update issue
    const failedChecks = results.filter((r) => !r.passed);
    const issueBody = generateIssueBody(failedChecks);

    if (existingIssueNumber) {
      await updateIssue(octokit, owner, repo, existingIssueNumber, issueBody);
      return `Note: Updated existing issue #${existingIssueNumber} with current findings.`;
    } else {
      const newIssueNumber = await createIssue(octokit, owner, repo, issueBody);
      return `Note: Created issue #${newIssueNumber} to track these configuration issues.`;
    }
  }
};
