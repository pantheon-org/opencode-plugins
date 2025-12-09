/**
 * Tests for repository settings checks (pure business logic)
 */

import {
  checkDefaultBranch,
  checkBranchProtection,
  checkAutoBranchDeletion,
  runAllChecks,
  allChecksPassed,
  getFailedChecks,
} from './checks';
import type { RepositoryData } from './types';

describe('checkDefaultBranch', () => {
  it('should pass when default branch is main', () => {
    const result = checkDefaultBranch('main');

    expect(result.passed).toBe(true);
    expect(result.name).toBe('Default branch');
    expect(result.current).toBe('main');
    expect(result.expected).toBe('main');
    expect(result.remediation).toBeUndefined();
  });

  it('should fail when default branch is not main', () => {
    const result = checkDefaultBranch('master');

    expect(result.passed).toBe(false);
    expect(result.current).toBe('master');
    expect(result.expected).toBe('main');
    expect(result.remediation).toContain('Settings → Branches');
  });

  it('should fail for other branch names', () => {
    const result = checkDefaultBranch('develop');

    expect(result.passed).toBe(false);
    expect(result.current).toBe('develop');
  });
});

describe('checkBranchProtection', () => {
  it('should pass when branch protection is enabled', () => {
    const result = checkBranchProtection(true);

    expect(result.passed).toBe(true);
    expect(result.name).toBe('Branch protection');
    expect(result.current).toBe('Enabled');
    expect(result.expected).toBe('Protection enabled');
    expect(result.remediation).toBeUndefined();
  });

  it('should fail when branch protection is disabled', () => {
    const result = checkBranchProtection(false);

    expect(result.passed).toBe(false);
    expect(result.current).toBe('No protection rules');
    expect(result.remediation).toContain('Settings → Branches → Add rule');
  });
});

describe('checkAutoBranchDeletion', () => {
  it('should pass when auto-delete is enabled', () => {
    const result = checkAutoBranchDeletion(true);

    expect(result.passed).toBe(true);
    expect(result.name).toBe('Automatic branch deletion');
    expect(result.current).toBe('Enabled');
    expect(result.expected).toBe('Enabled');
    expect(result.remediation).toBeUndefined();
  });

  it('should fail when auto-delete is disabled', () => {
    const result = checkAutoBranchDeletion(false);

    expect(result.passed).toBe(false);
    expect(result.current).toBe('Disabled');
    expect(result.remediation).toContain('Automatically delete head branches');
  });
});

describe('runAllChecks', () => {
  it('should return all checks when all settings are correct', () => {
    const repoData: RepositoryData = {
      defaultBranch: 'main',
      deleteBranchOnMerge: true,
    };

    const results = runAllChecks(repoData, true);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.passed)).toBe(true);
  });

  it('should return failed checks when settings are incorrect', () => {
    const repoData: RepositoryData = {
      defaultBranch: 'master',
      deleteBranchOnMerge: false,
    };

    const results = runAllChecks(repoData, false);

    expect(results).toHaveLength(3);
    expect(results.every((r) => !r.passed)).toBe(true);
  });

  it('should return mixed results', () => {
    const repoData: RepositoryData = {
      defaultBranch: 'main',
      deleteBranchOnMerge: false,
    };

    const results = runAllChecks(repoData, true);

    expect(results).toHaveLength(3);
    expect(results[0].passed).toBe(true); // Default branch
    expect(results[1].passed).toBe(true); // Branch protection
    expect(results[2].passed).toBe(false); // Auto-delete
  });
});

describe('allChecksPassed', () => {
  it('should return true when all checks passed', () => {
    const results = [
      { name: 'check1', passed: true, current: 'a', expected: 'a' },
      { name: 'check2', passed: true, current: 'b', expected: 'b' },
    ];

    expect(allChecksPassed(results)).toBe(true);
  });

  it('should return false when any check failed', () => {
    const results = [
      { name: 'check1', passed: true, current: 'a', expected: 'a' },
      { name: 'check2', passed: false, current: 'b', expected: 'c' },
    ];

    expect(allChecksPassed(results)).toBe(false);
  });

  it('should return false when all checks failed', () => {
    const results = [
      { name: 'check1', passed: false, current: 'a', expected: 'b' },
      { name: 'check2', passed: false, current: 'c', expected: 'd' },
    ];

    expect(allChecksPassed(results)).toBe(false);
  });

  it('should return true for empty array', () => {
    expect(allChecksPassed([])).toBe(true);
  });
});

describe('getFailedChecks', () => {
  it('should return only failed checks', () => {
    const results = [
      { name: 'check1', passed: true, current: 'a', expected: 'a' },
      { name: 'check2', passed: false, current: 'b', expected: 'c' },
      { name: 'check3', passed: false, current: 'd', expected: 'e' },
    ];

    const failed = getFailedChecks(results);

    expect(failed).toHaveLength(2);
    expect(failed[0].name).toBe('check2');
    expect(failed[1].name).toBe('check3');
  });

  it('should return empty array when all checks passed', () => {
    const results = [
      { name: 'check1', passed: true, current: 'a', expected: 'a' },
      { name: 'check2', passed: true, current: 'b', expected: 'b' },
    ];

    const failed = getFailedChecks(results);

    expect(failed).toHaveLength(0);
  });

  it('should return all checks when all failed', () => {
    const results = [
      { name: 'check1', passed: false, current: 'a', expected: 'b' },
      { name: 'check2', passed: false, current: 'c', expected: 'd' },
    ];

    const failed = getFailedChecks(results);

    expect(failed).toHaveLength(2);
  });
});
