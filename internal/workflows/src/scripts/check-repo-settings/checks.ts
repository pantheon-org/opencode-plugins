/**
 * Pure business logic functions for repository settings checks
 */

import type { CheckResult, RepositoryData } from './types';

/**
 * Check if the default branch is 'main'
 * @param defaultBranch - Current default branch name
 * @returns Check result indicating pass/fail
 */
export const checkDefaultBranch = (defaultBranch: string): CheckResult => {
  const passed = defaultBranch === 'main';
  return {
    name: 'Default branch',
    passed,
    current: defaultBranch,
    expected: 'main',
    remediation: passed ? undefined : 'Go to Settings → Branches → Change default branch to main',
  };
};

/**
 * Check if branch protection is enabled on main
 * @param hasProtection - Whether branch protection is enabled
 * @returns Check result indicating pass/fail
 */
export const checkBranchProtection = (hasProtection: boolean): CheckResult => {
  return {
    name: 'Branch protection',
    passed: hasProtection,
    current: hasProtection ? 'Enabled' : 'No protection rules',
    expected: 'Protection enabled',
    remediation: hasProtection ? undefined : 'Go to Settings → Branches → Add rule for main',
  };
};

/**
 * Check if automatic branch deletion after merge is enabled
 * @param deleteBranchOnMerge - Whether automatic branch deletion is enabled
 * @returns Check result indicating pass/fail
 */
export const checkAutoBranchDeletion = (deleteBranchOnMerge: boolean): CheckResult => {
  return {
    name: 'Automatic branch deletion',
    passed: deleteBranchOnMerge,
    current: deleteBranchOnMerge ? 'Enabled' : 'Disabled',
    expected: 'Enabled',
    remediation: deleteBranchOnMerge
      ? undefined
      : 'Go to Settings → General → Enable "Automatically delete head branches"',
  };
};

/**
 * Run all repository checks
 * @param repoData - Repository data to check
 * @param hasProtection - Whether branch protection is enabled
 * @returns Array of all check results
 */
export const runAllChecks = (repoData: RepositoryData, hasProtection: boolean): CheckResult[] => {
  return [
    checkDefaultBranch(repoData.defaultBranch),
    checkBranchProtection(hasProtection),
    checkAutoBranchDeletion(repoData.deleteBranchOnMerge),
  ];
};

/**
 * Check if all checks passed
 * @param results - Array of check results
 * @returns True if all checks passed
 */
export const allChecksPassed = (results: CheckResult[]): boolean => {
  return results.every((r) => r.passed);
};

/**
 * Get only failed checks
 * @param results - Array of check results
 * @returns Array containing only failed checks
 */
export const getFailedChecks = (results: CheckResult[]): CheckResult[] => {
  return results.filter((r) => !r.passed);
};
