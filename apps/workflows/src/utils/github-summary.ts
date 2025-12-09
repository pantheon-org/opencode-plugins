/**
 * GitHub Actions summary utilities
 */

import type { CheckResult } from '../scripts/check-repo-settings/types';

/**
 * Generate markdown summary for GitHub Actions
 * @param results - Array of check results
 * @param allPassed - Whether all checks passed
 * @param issueAction - Optional issue action message
 * @returns Formatted markdown summary
 */
export const generateSummary = (results: CheckResult[], allPassed: boolean, issueAction?: string): string => {
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
};

/**
 * Write summary to GitHub Actions step summary file
 * @param summary - Markdown summary to write
 */
export const writeSummaryToFile = async (summary: string): Promise<void> => {
  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('fs/promises');
    await fs.writeFile(process.env.GITHUB_STEP_SUMMARY, summary, 'utf-8');
  }
};
