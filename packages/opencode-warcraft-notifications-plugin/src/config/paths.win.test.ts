import { join } from 'path';

import { describe, it, expect } from 'bun:test';

import { getDefaultSoundsDir } from './index';

// Unit test: simulate Windows behavior by calling getDefaultSoundsDir()
// directly after mutating process.platform and APPDATA. Avoid relying on
// module-level DEFAULT_DATA_DIR which may have been evaluated earlier.

describe('plugin-config Windows behavior [unit]', () => {
  it('uses APPDATA when on win32 platform', () => {
    const originalPlatform = process.platform;
    const originalAppData = process.env.APPDATA;

    try {
      // Simulate Windows
      // @ts-expect-error - Testing platform override
      process.platform = 'win32';
      process.env.APPDATA = join('C:', 'Users', 'TestUser', 'AppData', 'Roaming');

      const dir = getDefaultSoundsDir();
      expect(typeof dir).toBe('string');

      const normalized = dir.replace(/\\/g, '/').toLowerCase();
      expect(normalized).toContain('appdata');
      expect(normalized).toContain('roaming');
      expect(normalized).toContain('opencode/storage/plugin');
    } finally {
      // Restore environment
      // @ts-expect-error - Restoring platform override
      process.platform = originalPlatform;
      process.env.APPDATA = originalAppData;
    }
  });
});
