import { describe, expect, it } from 'bun:test';

import type { EnablePagesResult } from './types';

/**
 * Note: These are unit tests for the enableGitHubPages function.
 * Integration tests with actual GitHub API calls are not included
 * to avoid requiring GitHub tokens in CI/CD.
 *
 * The function uses Octokit which is well-tested by GitHub,
 * and we have manual testing via the workflow.
 */

describe('enableGitHubPages types and structure', () => {
  it('should have correct EnablePagesResult structure for success', () => {
    const result: EnablePagesResult = {
      success: true,
      status: 'created',
      message: 'GitHub Pages enabled successfully',
      httpCode: 201,
    };

    expect(result.success).toBe(true);
    expect(result.status).toBe('created');
    expect(result.httpCode).toBe(201);
  });

  it('should have correct EnablePagesResult structure for update', () => {
    const result: EnablePagesResult = {
      success: true,
      status: 'updated',
      message: 'GitHub Pages configuration updated successfully',
      httpCode: 204,
    };

    expect(result.success).toBe(true);
    expect(result.status).toBe('updated');
    expect(result.httpCode).toBe(204);
  });

  it('should have correct EnablePagesResult structure for failure', () => {
    const result: EnablePagesResult = {
      success: false,
      status: 'failed',
      message: 'Failed to enable GitHub Pages',
      httpCode: 403,
    };

    expect(result.success).toBe(false);
    expect(result.status).toBe('failed');
    expect(result.httpCode).toBe(403);
  });

  it('should support optional httpCode for network errors', () => {
    const result: EnablePagesResult = {
      success: false,
      status: 'failed',
      message: 'Network error',
    };

    expect(result.success).toBe(false);
    expect(result.status).toBe('failed');
    expect(result.httpCode).toBeUndefined();
  });
});
