import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadPluginConfig } from './loader';

describe('loader utilities', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    // Create a temporary directory for test files
    testDir = join(tmpdir(), `opencode-loader-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, '.opencode'), { recursive: true });
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(() => {
    // Clean up and restore CWD
    process.chdir(originalCwd);
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('loadPluginConfig', () => {
    it('loads configuration from CWD/.opencode/plugin.json', async () => {
      const config = {
        'my-plugin': {
          enabled: true,
          apiKey: 'test-key',
        },
      };

      writeFileSync(join(testDir, '.opencode', 'plugin.json'), JSON.stringify(config));

      const result = await loadPluginConfig({
        pluginName: 'my-plugin',
      });

      expect(result).toEqual({ enabled: true, apiKey: 'test-key' });
    });

    it('returns empty object when no config found and no default provided', async () => {
      const result = await loadPluginConfig({
        pluginName: 'missing-plugin',
      });

      expect(result).toEqual({});
    });

    it('returns default config when no config file found', async () => {
      const defaultConfig = { enabled: false, timeout: 5000 };

      const result = await loadPluginConfig({
        pluginName: 'missing-plugin',
        defaultConfig,
      });

      expect(result).toEqual(defaultConfig);
    });

    it('validates configuration with custom validator', async () => {
      const config = {
        'my-plugin': {
          count: '10',
          enabled: 'yes',
        },
      };

      writeFileSync(join(testDir, '.opencode', 'plugin.json'), JSON.stringify(config));

      interface MyConfig {
        count: number;
        enabled: boolean;
      }

      const result = await loadPluginConfig<MyConfig>({
        pluginName: 'my-plugin',
        validator: (raw: unknown) => {
          const r = raw as any;
          return {
            count: Number(r.count),
            enabled: r.enabled === 'yes',
          };
        },
      });

      expect(result).toEqual({ count: 10, enabled: true });
    });

    it('throws error when validation fails', async () => {
      const config = {
        'my-plugin': {
          invalid: 'data',
        },
      };

      writeFileSync(join(testDir, '.opencode', 'plugin.json'), JSON.stringify(config));

      await expect(
        loadPluginConfig({
          pluginName: 'my-plugin',
          validator: () => {
            throw new Error('Configuration validation failed: Invalid config structure');
          },
        }),
      ).rejects.toThrow('Configuration validation failed');
    });

    it('uses custom config file name', async () => {
      const config = {
        'my-plugin': {
          custom: true,
        },
      };

      writeFileSync(join(testDir, '.opencode', 'custom.json'), JSON.stringify(config));

      const result = await loadPluginConfig({
        pluginName: 'my-plugin',
        configFileName: 'custom.json',
      });

      expect(result).toEqual({ custom: true });
    });

    it('handles missing plugin configuration in file', async () => {
      const config = {
        'other-plugin': {
          value: 123,
        },
      };

      writeFileSync(join(testDir, '.opencode', 'plugin.json'), JSON.stringify(config));

      const result = await loadPluginConfig({
        pluginName: 'my-plugin',
        defaultConfig: { default: true },
      });

      expect(result).toEqual({ default: true });
    });

    it('handles invalid JSON gracefully', async () => {
      writeFileSync(join(testDir, '.opencode', 'plugin.json'), 'invalid json {');

      const result = await loadPluginConfig({
        pluginName: 'my-plugin',
        defaultConfig: { fallback: true },
      });

      expect(result).toEqual({ fallback: true });
    });

    it('works with debug logging enabled', async () => {
      const config = {
        'my-plugin': {
          debug: true,
        },
      };

      writeFileSync(join(testDir, '.opencode', 'plugin.json'), JSON.stringify(config));

      const result = await loadPluginConfig({
        pluginName: 'my-plugin',
        debug: true,
      });

      expect(result).toEqual({ debug: true });
    });

    it('applies validator to default config when no file found', async () => {
      interface TypedConfig {
        enabled: boolean;
      }

      const result = await loadPluginConfig<TypedConfig>({
        pluginName: 'missing-plugin',
        validator: (raw: unknown) => {
          if (Object.keys(raw as object).length === 0) {
            return { enabled: false };
          }
          return raw as TypedConfig;
        },
      });

      expect(result).toEqual({ enabled: false });
    });

    it('handles nested configuration objects', async () => {
      const config = {
        'my-plugin': {
          server: {
            host: 'localhost',
            port: 3000,
          },
          features: {
            auth: true,
            cache: false,
          },
        },
      };

      writeFileSync(join(testDir, '.opencode', 'plugin.json'), JSON.stringify(config));

      const result = await loadPluginConfig({
        pluginName: 'my-plugin',
      });

      expect(result).toEqual({
        server: {
          host: 'localhost',
          port: 3000,
        },
        features: {
          auth: true,
          cache: false,
        },
      });
    });

    it('handles array configuration values', async () => {
      const config = {
        'my-plugin': {
          tags: ['important', 'production'],
          ports: [8080, 8081, 8082],
        },
      };

      writeFileSync(join(testDir, '.opencode', 'plugin.json'), JSON.stringify(config));

      const result = await loadPluginConfig({
        pluginName: 'my-plugin',
      });

      expect(result).toEqual({
        tags: ['important', 'production'],
        ports: [8080, 8081, 8082],
      });
    });
  });
});
