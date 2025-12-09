import { describe, it, expect } from 'bun:test';
import { OpencodeWarcraftNotificationsPlugin } from './index';

describe('OpencodeWarcraftNotificationsPlugin', () => {
  it('should be defined', () => {
    expect(OpencodeWarcraftNotificationsPlugin).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof OpencodeWarcraftNotificationsPlugin).toBe('function');
  });
});
