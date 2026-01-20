/**
 * Tests for formatCount
 */

import { formatCount } from './format-count';

describe('formatCount', () => {
  it('should format zero with plural', () => {
    expect(formatCount(0, 'item')).toBe('0 items');
  });

  it('should format one with singular', () => {
    expect(formatCount(1, 'item')).toBe('1 item');
  });

  it('should format multiple with plural', () => {
    expect(formatCount(5, 'item')).toBe('5 items');
    expect(formatCount(100, 'item')).toBe('100 items');
  });

  it('should use custom plural form', () => {
    expect(formatCount(0, 'repository', 'repositories')).toBe(
      '0 repositories',
    );
    expect(formatCount(1, 'repository', 'repositories')).toBe('1 repository');
    expect(formatCount(5, 'repository', 'repositories')).toBe(
      '5 repositories',
    );
  });

  it('should handle irregular plurals', () => {
    expect(formatCount(1, 'person', 'people')).toBe('1 person');
    expect(formatCount(3, 'person', 'people')).toBe('3 people');
  });
});
