import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

import { DEFAULT_CONFIG } from './config';
import { loadPluginConfig, createDefaultPluginConfig } from './load-plugin-config';

describe('load-plugin-config', () => {
  let tempDir: string;
  let opencodeDir: string;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = path.join(import.meta.dir, `test-temp-${Date.now()}`);
    opencodeDir = path.join(tempDir, '.opencode');
    await fs.mkdir(opencodeDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('loadPluginConfig', () => {
    it('should return default config when plugin.json does not exist', async () => {
      const config = await loadPluginConfig(tempDir);

      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should load config from plugin.json with full package name', async () => {
      const customConfig = {
        '@pantheon-org/opencode-agent-loader-plugin': {
          agentsDir: 'custom/agents',
          verbose: true,
          enableDefaultAgents: false,
          disabledDefaultAgents: ['code-reviewer'],
        },
      };

      await Bun.write(path.join(opencodeDir, 'plugin.json'), JSON.stringify(customConfig));

      const config = await loadPluginConfig(tempDir);

      expect(config.agentsDir).toBe('custom/agents');
      expect(config.verbose).toBe(true);
      expect(config.enableDefaultAgents).toBe(false);
      expect(config.disabledDefaultAgents).toEqual(['code-reviewer']);
    });

    it('should load config from plugin.json with short package name', async () => {
      const customConfig = {
        'opencode-agent-loader-plugin': {
          agentsDir: 'custom/agents',
          verbose: true,
        },
      };

      await Bun.write(path.join(opencodeDir, 'plugin.json'), JSON.stringify(customConfig));

      const config = await loadPluginConfig(tempDir);

      expect(config.agentsDir).toBe('custom/agents');
      expect(config.verbose).toBe(true);
    });

    it('should merge partial config with defaults', async () => {
      const customConfig = {
        '@pantheon-org/opencode-agent-loader-plugin': {
          verbose: true,
          // Other fields should come from defaults
        },
      };

      await Bun.write(path.join(opencodeDir, 'plugin.json'), JSON.stringify(customConfig));

      const config = await loadPluginConfig(tempDir);

      expect(config.verbose).toBe(true);
      expect(config.agentsDir).toBe(DEFAULT_CONFIG.agentsDir);
      expect(config.patterns).toEqual(DEFAULT_CONFIG.patterns);
      expect(config.enableDefaultAgents).toBe(DEFAULT_CONFIG.enableDefaultAgents);
    });

    it('should return defaults when plugin.json is invalid JSON', async () => {
      await Bun.write(path.join(opencodeDir, 'plugin.json'), 'invalid json{');

      const config = await loadPluginConfig(tempDir);

      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should return defaults when plugin config key is missing', async () => {
      const customConfig = {
        'some-other-plugin': {
          option: 'value',
        },
      };

      await Bun.write(path.join(opencodeDir, 'plugin.json'), JSON.stringify(customConfig));

      const config = await loadPluginConfig(tempDir);

      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should handle arrays in config correctly', async () => {
      const customConfig = {
        '@pantheon-org/opencode-agent-loader-plugin': {
          patterns: ['**/*.ts'],
          disabledDefaultAgents: ['agent1', 'agent2'],
        },
      };

      await Bun.write(path.join(opencodeDir, 'plugin.json'), JSON.stringify(customConfig));

      const config = await loadPluginConfig(tempDir);

      expect(config.patterns).toEqual(['**/*.ts']);
      expect(config.disabledDefaultAgents).toEqual(['agent1', 'agent2']);
    });
  });

  describe('createDefaultPluginConfig', () => {
    it('should create plugin.json with default config', async () => {
      const created = await createDefaultPluginConfig(tempDir);

      expect(created).toBe(true);

      const file = Bun.file(path.join(opencodeDir, 'plugin.json'));
      expect(await file.exists()).toBe(true);

      const content = await file.json();
      expect(content['@pantheon-org/opencode-agent-loader-plugin']).toBeDefined();
      expect(content['@pantheon-org/opencode-agent-loader-plugin'].agentsDir).toBe('.opencode/agent');
    });

    it('should not overwrite existing plugin.json', async () => {
      const existingConfig = {
        '@pantheon-org/opencode-agent-loader-plugin': {
          agentsDir: 'existing/path',
        },
      };

      await Bun.write(path.join(opencodeDir, 'plugin.json'), JSON.stringify(existingConfig));

      const created = await createDefaultPluginConfig(tempDir);

      expect(created).toBe(false);

      const file = Bun.file(path.join(opencodeDir, 'plugin.json'));
      const content = await file.json();
      expect(content['@pantheon-org/opencode-agent-loader-plugin'].agentsDir).toBe('existing/path');
    });

    it('should create valid JSON', async () => {
      await createDefaultPluginConfig(tempDir);

      const file = Bun.file(path.join(opencodeDir, 'plugin.json'));
      const content = await file.text();

      // Should not throw
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });
});
