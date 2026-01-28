import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { homedir } from 'os';
import { join } from 'path';

import { getConfigDir, getConfigPaths, getDataDir, getPluginStorageDir } from './paths';

describe('paths utilities', () => {
  let originalPlatform: NodeJS.Platform;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalPlatform = process.platform;
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true,
      configurable: true,
    });
    process.env = originalEnv;
  });

  describe('getConfigDir', () => {
    it('returns ~/.config on macOS', () => {
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        writable: true,
        configurable: true,
      });

      const dir = getConfigDir();
      expect(dir).toBe(join(homedir(), '.config'));
    });

    it('returns ~/.config on Linux by default', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true,
      });
      delete process.env.XDG_CONFIG_HOME;

      const dir = getConfigDir();
      expect(dir).toBe(join(homedir(), '.config'));
    });

    it('uses XDG_CONFIG_HOME on Linux when set', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true,
      });
      process.env.XDG_CONFIG_HOME = '/custom/config';

      const dir = getConfigDir();
      expect(dir).toBe('/custom/config');
    });

    it('returns AppData/Roaming on Windows by default', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true,
      });
      delete process.env.APPDATA;

      const dir = getConfigDir();
      expect(dir).toBe(join(homedir(), 'AppData', 'Roaming'));
    });

    it('uses APPDATA on Windows when set', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true,
      });
      process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';

      const dir = getConfigDir();
      expect(dir).toBe('C:\\Users\\Test\\AppData\\Roaming');
    });
  });

  describe('getDataDir', () => {
    it('returns ~/.local/share on macOS by default', () => {
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        writable: true,
        configurable: true,
      });
      delete process.env.XDG_DATA_HOME;

      const dir = getDataDir();
      expect(dir).toBe(join(homedir(), '.local', 'share'));
    });

    it('returns ~/.local/share on Linux by default', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true,
      });
      delete process.env.XDG_DATA_HOME;

      const dir = getDataDir();
      expect(dir).toBe(join(homedir(), '.local', 'share'));
    });

    it('uses XDG_DATA_HOME on Linux when set', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true,
      });
      process.env.XDG_DATA_HOME = '/custom/data';

      const dir = getDataDir();
      expect(dir).toBe('/custom/data');
    });

    it('returns AppData/Roaming on Windows by default', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true,
      });
      delete process.env.APPDATA;

      const dir = getDataDir();
      expect(dir).toBe(join(homedir(), 'AppData', 'Roaming'));
    });

    it('uses APPDATA on Windows when set', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true,
      });
      process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';

      const dir = getDataDir();
      expect(dir).toBe('C:\\Users\\Test\\AppData\\Roaming');
    });
  });

  describe('getPluginStorageDir', () => {
    it('returns plugin storage path without subdirectory', () => {
      const dir = getPluginStorageDir('@pantheon-org/my-plugin');

      expect(dir).toContain('opencode');
      expect(dir).toContain('storage');
      expect(dir).toContain('plugin');
      expect(dir).toContain('@pantheon-org');
      expect(dir).toContain('my-plugin');
    });

    it('returns plugin storage path with subdirectory', () => {
      const dir = getPluginStorageDir('@pantheon-org/my-plugin', 'sounds');

      expect(dir).toContain('opencode');
      expect(dir).toContain('storage');
      expect(dir).toContain('plugin');
      expect(dir).toContain('@pantheon-org');
      expect(dir).toContain('my-plugin');
      expect(dir).toContain('sounds');
    });

    it('handles plugin names without scope', () => {
      const dir = getPluginStorageDir('simple-plugin');

      expect(dir).toContain('opencode');
      expect(dir).toContain('storage');
      expect(dir).toContain('plugin');
      expect(dir).toContain('simple-plugin');
    });

    it('handles multiple subdirectory levels', () => {
      const dir = getPluginStorageDir('@pantheon-org/my-plugin', join('data', 'cache'));

      expect(dir).toContain('opencode');
      expect(dir).toContain('storage');
      expect(dir).toContain('plugin');
      expect(dir).toContain('@pantheon-org');
      expect(dir).toContain('my-plugin');
      expect(dir).toContain('data');
      expect(dir).toContain('cache');
    });
  });

  describe('getConfigPaths', () => {
    it('returns array with CWD and config dir paths', () => {
      const paths = getConfigPaths();

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBe(2);
      expect(paths[0]).toContain('.opencode');
      expect(paths[0]).toContain('plugin.json');
      expect(paths[1]).toContain('opencode');
      expect(paths[1]).toContain('plugin.json');
    });

    it('uses custom config file name', () => {
      const paths = getConfigPaths('custom.json');

      expect(paths[0]).toContain('.opencode');
      expect(paths[0]).toContain('custom.json');
      expect(paths[0]).not.toContain('plugin.json');
      expect(paths[1]).toContain('opencode');
      expect(paths[1]).toContain('custom.json');
    });

    it('prioritizes CWD over global config', () => {
      const paths = getConfigPaths();

      // First path should be CWD/.opencode/plugin.json
      expect(paths[0]).toContain(process.cwd());
      expect(paths[0]).toContain('.opencode');

      // Second path should be global config
      expect(paths[1]).toContain(homedir());
    });
  });
});
