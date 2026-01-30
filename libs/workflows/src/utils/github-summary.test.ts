/**
 * Tests for GitHub Actions summary generator
 */

import type { CheckResult } from '../scripts/check-repo-settings/types';

import { generateSummary, writeSummaryToFile } from './github-summary';

describe('generateSummary', () => {
  const passedCheck: CheckResult = {
    name: 'Default branch',
    passed: true,
    current: 'main',
    expected: 'main',
  };

  const failedCheck: CheckResult = {
    name: 'Branch protection',
    passed: false,
    current: 'No protection',
    expected: 'Protection enabled',
    remediation: 'Go to Settings → Branches',
  };

  it('should generate summary for all passed checks', () => {
    const summary = generateSummary([passedCheck], true);

    expect(summary).toContain('✅');
    expect(summary).toContain('All Passed');
    expect(summary).toContain('Default branch**: main');
    expect(summary).toContain('complies with organizational standards');
  });

  it('should generate summary for failed checks', () => {
    const summary = generateSummary([failedCheck], false);

    expect(summary).toContain('⚠️');
    expect(summary).toContain('Issues Found');
    expect(summary).toContain('Branch protection');
    expect(summary).toContain('Expected: Protection enabled');
    expect(summary).toContain('Action: Go to Settings → Branches');
    expect(summary).toContain('Please review and update');
  });

  it('should generate summary with mixed results', () => {
    const summary = generateSummary([passedCheck, failedCheck], false);

    expect(summary).toContain('✅');
    expect(summary).toContain('❌');
    expect(summary).toContain('Default branch');
    expect(summary).toContain('Branch protection');
  });

  it('should include issue action when provided', () => {
    const issueAction = 'Note: Created issue #123';
    const summary = generateSummary([failedCheck], false, issueAction);

    expect(summary).toContain(issueAction);
  });

  it('should not include remediation for passed checks', () => {
    const summary = generateSummary([passedCheck], true);

    expect(summary).not.toContain('Expected:');
    expect(summary).not.toContain('Action:');
  });
});

describe('writeSummaryToFile', () => {
  it('should write summary to file when GITHUB_STEP_SUMMARY is set', async () => {
    const summaryPath = `/tmp/test-summary-${Date.now()}.md`;
    process.env.GITHUB_STEP_SUMMARY = summaryPath;

    const summary = 'Test summary';

    // This will actually write to the file in test
    await writeSummaryToFile(summary);

    // Verify file was written
    const fsPromises = await import('node:fs/promises');
    const content = await fsPromises.readFile(summaryPath, 'utf-8');
    expect(content).toBe(summary);

    // Cleanup
    await fsPromises.unlink(summaryPath);
  });

  it('should not write when GITHUB_STEP_SUMMARY is not set', async () => {
    process.env.GITHUB_STEP_SUMMARY = undefined;

    const summary = 'Test summary';

    // Should not throw
    await writeSummaryToFile(summary);
  });
});
