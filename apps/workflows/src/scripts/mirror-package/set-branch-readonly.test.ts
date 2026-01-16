import { describe, expect, it } from 'bun:test';

import type { BranchProtectionResult } from './types';

describe('BranchProtectionResult Type', () => {
  it('should define a successful branch protection result', () => {
    const result: BranchProtectionResult = {
      success: true,
      status: 'protected',
      message: 'Branch main is now read-only',
      httpCode: 200,
    };

    expect(result.success).toBe(true);
    expect(result.status).toBe('protected');
    expect(result.httpCode).toBe(200);
  });

  it('should define a failed branch protection result', () => {
    const result: BranchProtectionResult = {
      success: false,
      status: 'failed',
      message: 'Failed to set branch protection: Unauthorized',
      httpCode: 401,
    };

    expect(result.success).toBe(false);
    expect(result.status).toBe('failed');
    expect(result.httpCode).toBe(401);
  });

  it('should allow optional httpCode', () => {
    const result: BranchProtectionResult = {
      success: false,
      status: 'failed',
      message: 'Unknown error',
    };

    expect(result.httpCode).toBeUndefined();
  });

  it('should only allow valid status values', () => {
    // TypeScript compile-time check - these should type correctly
    const protectedStatus: BranchProtectionResult['status'] = 'protected';
    const failedStatus: BranchProtectionResult['status'] = 'failed';

    expect(protectedStatus).toBe('protected');
    expect(failedStatus).toBe('failed');
  });
});
