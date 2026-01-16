/**
 * Type definitions for repository settings checker
 */

/**
 * Result of a single repository settings check
 */
export interface CheckResult {
  /** Display name of the check */
  name: string;
  /** Whether the check passed */
  passed: boolean;
  /** Current value found in the repository */
  current: string;
  /** Expected value according to standards */
  expected: string;
  /** Optional remediation instructions if check failed */
  remediation?: string;
}

/**
 * Repository data needed for checks
 */
export interface RepositoryData {
  /** Default branch name */
  defaultBranch: string;
  /** Whether automatic branch deletion is enabled */
  deleteBranchOnMerge: boolean;
}

/**
 * Configuration for the repository checker
 */
export interface CheckerConfig {
  /** GitHub API token */
  token: string;
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
}
