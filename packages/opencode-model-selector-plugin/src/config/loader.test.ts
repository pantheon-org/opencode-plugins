import { describe, expect, test, spyOn } from 'bun:test';
import { z } from 'zod';
import { loadPluginConfig, savePluginConfig, loadCache, saveCache, setCacheEntry } from './loader';
import { PluginConfigSchema } from './types';

describe('loader', () => {
  const testWorktree = '/test-worktree';

  test('should load valid plugin config', async () => {
    const validConfig = {
      '@pantheon-org/opencode-model-selector-plugin': {
        autoPrompt: true,
        models: {
          large: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
          small: { provider: 'openai', model: 'gpt-4o-mini' },
        },
      },
    };

    const mockFile = () => ({
      exists: () => Promise.resolve(true),
      json: () => Promise.resolve(validConfig),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const config = await loadPluginConfig(testWorktree);
    expect(config.autoPrompt).toBe(true);
    expect(config.models?.large?.provider).toBe('anthropic');
    expect(config.models?.large?.model).toBe('claude-3-5-sonnet');
    expect(config.models?.small?.provider).toBe('openai');
    expect(config.models?.small?.model).toBe('gpt-4o-mini');
  });

  test('should handle missing config file', async () => {
    const mockFile = () => ({
      exists: () => Promise.resolve(false),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const config = await loadPluginConfig(testWorktree);
    expect(config.autoPrompt).toBe(true); // Default value
    expect(config.models).toBeUndefined();
  });

  test('should validate config with Zod schema', async () => {
    const invalidConfig = {
      '@pantheon-org/opencode-model-selector-plugin': {
        autoPrompt: 'invalid', // Should be boolean
        models: {
          large: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
        },
      },
    };

    const mockFile = () => ({
      exists: () => Promise.resolve(true),
      json: () => Promise.resolve(invalidConfig),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const config = await loadPluginConfig(testWorktree);
    expect(config.autoPrompt).toBe(true); // Should fallback to default due to validation error
  });

  test('should return default config when invalid', async () => {
    const invalidConfig = {
      '@pantheon-org/opencode-model-selector-plugin': {
        models: {
          large: { provider: 123, model: 'claude-3-5-sonnet' }, // Invalid type
        },
      },
    };

    const mockFile = () => ({
      exists: () => Promise.resolve(true),
      json: () => Promise.resolve(invalidConfig),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const config = await loadPluginConfig(testWorktree);
    expect(config.autoPrompt).toBe(true); // Default value
  });

  test('should save new plugin config', async () => {
    let writtenData: any;
    const newConfig = { autoPrompt: false };

    const mockFile = () => ({
      exists: () => Promise.resolve(false),
      write: (data: string) => {
        writtenData = JSON.parse(data);
        return Promise.resolve(100);
      },
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);
    spyOn(Bun, 'write').mockImplementation(mockFile().write as any);

    await savePluginConfig(testWorktree, newConfig);

    expect(writtenData['@pantheon-org/opencode-model-selector-plugin'].autoPrompt).toBe(false);
  });

  test('should update existing plugin config', async () => {
    const existingConfig = {
      '@pantheon-org/opencode-model-selector-plugin': {
        autoPrompt: true,
        models: {
          large: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
        },
      },
    };

    let writtenData: any;
    const updateConfig = { autoPrompt: false };

    const mockFile = () => ({
      exists: () => Promise.resolve(true),
      json: () => Promise.resolve(existingConfig),
      write: (data: string) => {
        writtenData = JSON.parse(data);
        return Promise.resolve(100);
      },
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);
    spyOn(Bun, 'write').mockImplementation(mockFile().write as any);

    await savePluginConfig(testWorktree, updateConfig);

    expect(writtenData['@pantheon-org/opencode-model-selector-plugin'].autoPrompt).toBe(false);
    expect(writtenData['@pantheon-org/opencode-model-selector-plugin'].models.large.provider).toBe('anthropic');
  });

  test('should handle file permission errors on save', async () => {
    const mockFile = () => ({
      exists: () => Promise.resolve(false),
      write: () => Promise.reject(new Error('Permission denied')),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);
    spyOn(Bun, 'write').mockImplementation(mockFile().write as any);

    await expect(savePluginConfig(testWorktree, { autoPrompt: false })).rejects.toThrow('Permission denied');
  });

  test('should load valid cache with unexpired TTL', async () => {
    const now = Date.now();
    const validCache = {
      models: {
        data: [{ id: 'test-model', name: 'Test Model' }],
        timestamp: now,
        ttl: 3600000, // 1 hour
      },
    };

    const mockFile = () => ({
      exists: () => Promise.resolve(true),
      json: () => Promise.resolve(validCache),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const cache = await loadCache(testWorktree);
    expect(cache.models).toBeDefined();
    expect(cache.models?.data).toHaveLength(1);
  });

  test('should remove expired cache entries', async () => {
    const expiredTime = Date.now() - 7200000; // 2 hours ago
    const expiredCache = {
      models: {
        data: [{ id: 'test-model', name: 'Test Model' }],
        timestamp: expiredTime,
        ttl: 3600000, // 1 hour
      },
    };

    const mockFile = () => ({
      exists: () => Promise.resolve(true),
      json: () => Promise.resolve(expiredCache),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const cache = await loadCache(testWorktree);
    expect(cache.models).toBeUndefined();
  });

  test('should handle missing cache file', async () => {
    const mockFile = () => ({
      exists: () => Promise.resolve(false),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const cache = await loadCache(testWorktree);
    expect(cache).toEqual({});
  });

  test('should handle corrupted cache JSON', async () => {
    const mockFile = () => ({
      exists: () => Promise.resolve(true),
      json: () => Promise.reject(new Error('Unexpected token')),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const cache = await loadCache(testWorktree);
    expect(cache).toEqual({});
  });

  test('should save cache successfully', async () => {
    let writtenData: any;
    const testCache = {
      models: {
        data: [{ id: 'test-model', name: 'Test Model' }],
        timestamp: Date.now(),
        ttl: 3600000,
      },
    };

    const mockFile = () => ({
      write: (data: string) => {
        writtenData = JSON.parse(data);
        return Promise.resolve(100);
      },
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);
    spyOn(Bun, 'write').mockImplementation(mockFile().write as any);

    await saveCache(testWorktree, testCache);

    expect(writtenData).toEqual(testCache);
  });

  test('should create cache entry with correct structure', () => {
    const testData = { test: 'data' };
    const cache = setCacheEntry({}, 'models', testData, 3600000);

    expect(cache.models).toBeDefined();
    expect(cache.models?.data).toEqual(testData);
    expect(cache.models?.timestamp).toBeLessThanOrEqual(Date.now());
    expect(cache.models?.ttl).toBe(3600000);
  });

  test('should handle file system errors gracefully', async () => {
    const mockFile = () => ({
      exists: () => Promise.reject(new Error('File system error')),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile);

    const config = await loadPluginConfig(testWorktree);
    expect(config.autoPrompt).toBe(true); // Should fallback to default
  });
});
