/**
 * Tests for failure helper
 */

import { failure } from './failure';

describe('failure', () => {
  it('should create an error response', () => {
    const message = 'Operation failed';
    const response = failure(message);

    expect(response.success).toBe(false);
    expect(response.error?.message).toBe('Operation failed');
    expect(response.metadata.timestamp).toBeDefined();
  });

  it('should include error code when provided', () => {
    const response = failure('API error', { code: 'API_ERROR' });

    expect(response.error?.code).toBe('API_ERROR');
  });

  it('should include error context when provided', () => {
    const context = {
      statusCode: 403,
      endpoint: '/api/data',
      retryable: false,
    };

    const response = failure('Access denied', { context });

    expect(response.error?.context).toEqual(context);
  });

  it('should merge additional metadata', () => {
    const metadata = {
      sessionID: 'session-123',
      duration: 2000,
    };

    const response = failure('Operation timeout', { metadata });

    expect(response.metadata.sessionID).toBe('session-123');
    expect(response.metadata.duration).toBe(2000);
    expect(response.metadata.timestamp).toBeDefined();
  });

  it('should handle all options together', () => {
    const response = failure('Complete error', {
      code: 'CUSTOM_ERROR',
      context: { detail: 'More info' },
      metadata: { sessionID: 'test' },
    });

    expect(response.success).toBe(false);
    expect(response.error?.message).toBe('Complete error');
    expect(response.error?.code).toBe('CUSTOM_ERROR');
    expect(response.error?.context).toEqual({ detail: 'More info' });
    expect(response.metadata.sessionID).toBe('test');
  });

  it('should have undefined data property', () => {
    const response = failure('Test error');

    expect(response.data).toBeUndefined();
  });
});
