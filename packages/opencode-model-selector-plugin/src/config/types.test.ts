import { describe, expect, test } from 'bun:test';
import { PluginConfigSchema } from './types';

describe('types', () => {
  test('should validate correct plugin configuration', () => {
    const validConfig = {
      autoPrompt: true,
      models: {
        large: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
        },
        small: {
          provider: 'openai',
          model: 'gpt-4o-mini',
        },
      },
      classification: {
        contextThreshold: 100000,
        preferCostEffective: true,
        weightContext: 0.3,
        weightCost: 0.3,
        weightCapability: 0.4,
      },
    };

    const result = PluginConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);

    if (result.success) {
      const parsed = result.data;
      expect(parsed.autoPrompt).toBe(true);
      expect(parsed.models?.large?.provider).toBe('anthropic');
      expect(parsed.models?.large?.model).toBe('claude-3-5-sonnet-20241022');
      expect(parsed.models?.small?.provider).toBe('openai');
      expect(parsed.models?.small?.model).toBe('gpt-4o-mini');
      expect(parsed.classification?.contextThreshold).toBe(100000);
    }
  });

  test('should apply default values for missing fields', () => {
    const partialConfig = {
      models: {
        large: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet',
        },
      },
    };

    const result = PluginConfigSchema.safeParse(partialConfig);
    expect(result.success).toBe(true);

    if (result.success) {
      const parsed = result.data;
      expect(parsed.autoPrompt).toBe(true); // Default
      expect(parsed.models?.large?.provider).toBe('anthropic');
      expect(parsed.models?.small).toBeUndefined(); // Not provided
      expect(parsed.classification?.contextThreshold).toBe(100000); // Default
    }
  });

  test('should reject invalid autoPrompt type', () => {
    const invalidConfig = {
      autoPrompt: 'true', // Should be boolean
      models: {
        large: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet',
        },
      },
    };

    const result = PluginConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  test('should reject invalid model structure', () => {
    const invalidConfig = {
      models: {
        large: {
          provider: 123, // Should be string
          model: 'claude-3-5-sonnet',
        },
      },
    };

    const result = PluginConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  test('should reject invalid classification weights', () => {
    const invalidConfig = {
      autoPrompt: true,
      classification: {
        contextThreshold: 100000,
        preferCostEffective: true,
        weightContext: 1.5, // Should be <= 1
        weightCost: 0.3,
        weightCapability: 0.4,
      },
    };

    const result = PluginConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  test('should accept valid cache configuration', () => {
    const cacheConfig = {
      autoPrompt: true,
      cache: {
        ttl: 3600000, // 1 hour
        modelsDevTtl: 86400000, // 24 hours
      },
    };

    const result = PluginConfigSchema.safeParse(cacheConfig);
    expect(result.success).toBe(true);

    if (result.success) {
      const parsed = result.data;
      expect(parsed.cache?.ttl).toBe(3600000);
      expect(parsed.cache?.modelsDevTtl).toBe(86400000);
    }
  });

  test('should handle empty configuration', () => {
    const emptyConfig = {};

    const result = PluginConfigSchema.safeParse(emptyConfig);
    expect(result.success).toBe(true);

    if (result.success) {
      const parsed = result.data;
      expect(parsed.autoPrompt).toBe(true); // Default
      expect(parsed.models).toBeUndefined();
      expect(parsed.classification?.contextThreshold).toBe(100000); // Default
    }
  });

  test('should validate provider names in models', () => {
    const validConfig = {
      models: {
        large: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
        },
        small: {
          provider: 'google',
          model: 'gemini-pro',
        },
      },
    };

    const result = PluginConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  test('should reject null values for required fields', () => {
    const invalidConfig = {
      models: {
        large: {
          provider: null, // Should not be null
          model: 'claude-3-5-sonnet',
        },
      },
    };

    const result = PluginConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});
