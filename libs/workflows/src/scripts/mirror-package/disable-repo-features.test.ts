import { describe, expect, it } from 'bun:test';

import type { DisableFeaturesResult } from './types';

describe('DisableFeaturesResult Type', () => {
  it('should define a successful features disabled result', () => {
    const result: DisableFeaturesResult = {
      success: true,
      status: 'disabled',
      message: 'Repository features disabled successfully',
      disabledFeatures: ['issues', 'projects', 'wiki', 'downloads'],
      httpCode: 200,
    };

    expect(result.success).toBe(true);
    expect(result.status).toBe('disabled');
    expect(result.disabledFeatures).toHaveLength(4);
    expect(result.httpCode).toBe(200);
  });

  it('should define a failed features disabled result', () => {
    const result: DisableFeaturesResult = {
      success: false,
      status: 'failed',
      message: 'Failed to disable repository features: Unauthorized',
      disabledFeatures: [],
      httpCode: 401,
    };

    expect(result.success).toBe(false);
    expect(result.status).toBe('failed');
    expect(result.disabledFeatures).toHaveLength(0);
    expect(result.httpCode).toBe(401);
  });

  it('should allow optional httpCode', () => {
    const result: DisableFeaturesResult = {
      success: false,
      status: 'failed',
      message: 'Unknown error',
      disabledFeatures: [],
    };

    expect(result.httpCode).toBeUndefined();
  });

  it('should require disabledFeatures array', () => {
    const result: DisableFeaturesResult = {
      success: true,
      status: 'disabled',
      message: 'Success',
      disabledFeatures: ['issues'],
    };

    expect(Array.isArray(result.disabledFeatures)).toBe(true);
    expect(result.disabledFeatures).toContain('issues');
  });

  it('should only allow valid status values', () => {
    // TypeScript compile-time check - these should type correctly
    const disabledStatus: DisableFeaturesResult['status'] = 'disabled';
    const failedStatus: DisableFeaturesResult['status'] = 'failed';

    expect(disabledStatus).toBe('disabled');
    expect(failedStatus).toBe('failed');
  });
});
