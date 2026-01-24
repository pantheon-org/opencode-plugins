import { describe, it, expect } from 'bun:test';

import { getPackageName } from './package';

describe('package utilities', () => {
  describe('getPackageName', () => {
    it('returns package name string or null', () => {
      const name = getPackageName();
      expect(name === null || typeof name === 'string').toBe(true);
    });

    it('returns non-empty string when package name found', () => {
      const name = getPackageName();
      if (name !== null) {
        expect(name.length).toBeGreaterThan(0);
      }
    });

    it('handles debug mode without errors', () => {
      expect(() => getPackageName(true)).not.toThrow();
      expect(() => getPackageName(false)).not.toThrow();
    });

    it('returns consistent result across multiple calls', () => {
      const name1 = getPackageName();
      const name2 = getPackageName();
      expect(name1).toBe(name2);
    });

    it('returns scoped package name format when available', () => {
      const name = getPackageName();
      if (name !== null && name.includes('@')) {
        // Should be in @scope/package format
        expect(name).toMatch(/^@[\w-]+\/[\w-]+$/);
      }
    });

    it('works without crashing in production environment', () => {
      // In production, this function should always return a valid name
      // or null if it genuinely cannot find package.json
      const result = getPackageName();
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });
});
