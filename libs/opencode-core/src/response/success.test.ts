/**
 * Tests for success helper
 */

import { success } from './success';

describe('success', () => {
  it('should create a success response with data', () => {
    const data = { id: 1, name: 'Test' };
    const response = success(data);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.metadata.timestamp).toBeDefined();
  });

  it('should include timestamp in metadata', () => {
    const response = success({ test: 'data' });

    expect(typeof response.metadata.timestamp).toBe('number');
    expect(response.metadata.timestamp).toBeGreaterThan(0);
  });

  it('should merge additional metadata', () => {
    const data = [1, 2, 3];
    const metadata = {
      sessionID: 'session-123',
      messageID: 'msg-456',
      duration: 1500,
    };

    const response = success(data, metadata);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.metadata.sessionID).toBe('session-123');
    expect(response.metadata.messageID).toBe('msg-456');
    expect(response.metadata.duration).toBe(1500);
    expect(response.metadata.timestamp).toBeDefined();
  });

  it('should include pagination metadata when provided', () => {
    const data = [1, 2, 3];
    const metadata = {
      pagination: {
        page: 1,
        perPage: 10,
        total: 100,
        hasMore: true,
      },
    };

    const response = success(data, metadata);

    expect(response.metadata.pagination).toEqual({
      page: 1,
      perPage: 10,
      total: 100,
      hasMore: true,
    });
  });

  it('should handle empty data', () => {
    const response = success([]);

    expect(response.success).toBe(true);
    expect(response.data).toEqual([]);
  });

  it('should handle null data', () => {
    const response = success(null);

    expect(response.success).toBe(true);
    expect(response.data).toBeNull();
  });
});
