import { describe, expect, test, spyOn } from 'bun:test';
import {
  fetchModelsDevData,
  findModelsDevModel,
  enrichModelFromDev,
  getModelsDevProvider,
  getModelsDevProviderModels,
  convertModelsDevModel,
  createSyntheticModels,
} from './models-dev';

describe('models-dev', () => {
  const testWorktree = '/test-worktree';

  test('should fetch Models.dev data successfully', async () => {
    const mockModelsDevResponse = {
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          type: 'text',
          context_window: 200000,
          max_output: 8192,
          input_price: 3,
          output_price: 15,
          capabilities: ['text', 'code', 'vision'],
          status: 'available',
        },
      ],
      providers: [
        {
          name: 'anthropic',
          type: 'anthropic',
          auth_method: 'api-key',
        },
      ],
    };

    const mockFetch = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockModelsDevResponse),
      } as Response);

    global.fetch = mockFetch;

    // Mock cache load to return no cache
    spyOn({} as any, 'loadCache').mockResolvedValue({});

    const result = await fetchModelsDevData(testWorktree);
    expect(result.models).toHaveLength(1);
    expect(result.providers).toHaveLength(1);
    expect(result.models[0].name).toBe('Claude 3.5 Sonnet');
    expect(result.models[0].context_window).toBe(200000);
  });

  test('should handle Models.dev API errors', async () => {
    const mockFetch = () =>
      Promise.resolve({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response);

    global.fetch = mockFetch;

    spyOn({} as any, 'loadCache').mockResolvedValue({});
    spyOn({} as any, 'saveCache').mockResolvedValue();

    const result = await fetchModelsDevData(testWorktree);
    expect(result.models).toHaveLength(0);
    expect(result.providers).toHaveLength(0);
  });

  test('should use cached data within TTL', async () => {
    const now = Date.now();
    const cachedData = {
      models: [
        {
          id: 'cached-model',
          name: 'Cached Model',
          provider: 'test',
          type: 'text',
          context_window: 100000,
          status: 'available',
        },
      ],
      providers: [],
    };

    const mockCache = {
      modelsDev: {
        data: cachedData,
        timestamp: now,
        ttl: 86400000, // 24 hours
      },
    };

    spyOn({} as any, 'loadCache').mockResolvedValue(mockCache);

    const result = await fetchModelsDevData(testWorktree);
    expect(result.models).toEqual(cachedData.models);
    expect(result.models[0].name).toBe('Cached Model');
  });

  test('should find exact model match', async () => {
    const modelsDevData = {
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          context_window: 200000,
          capabilities: ['text', 'code'],
          status: 'available',
        },
      ],
    };

    const modelInfo = {
      id: 'anthropic/claude-3-5-sonnet-20241022',
      name: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      providerType: 'anthropic' as const,
      capabilities: ['text'],
      available: true,
      source: 'config' as const,
    };

    const result = findModelsDevModel(modelInfo, modelsDevData);
    expect(result).toBeDefined();
    expect(result!.id).toBe('claude-3-5-sonnet-20241022');
    expect(result!.name).toBe('Claude 3.5 Sonnet');
  });

  test('should find provider-specific match', async () => {
    const modelsDevData = {
      models: [
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          provider: 'google',
          context_window: 1000000,
          capabilities: ['text', 'code'],
          status: 'available',
        },
      ],
    };

    const modelInfo = {
      id: 'google/gemini-pro',
      name: 'Gemini Pro Model',
      provider: 'google',
      providerType: 'google' as const,
      capabilities: ['text'],
      available: true,
      source: 'config' as const,
    };

    const result = findModelsDevModel(modelInfo, modelsDevData);
    expect(result).toBeDefined();
    expect(result!.provider).toBe('google');
  });

  test('should find partial match', async () => {
    const modelsDevData = {
      models: [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          context_window: 200000,
          capabilities: ['text', 'code'],
          status: 'available',
        },
      ],
    };

    const modelInfo = {
      id: 'anthropic/claude-3-opus',
      name: 'claude-3-opus-20240229',
      provider: 'anthropic',
      providerType: 'anthropic' as const,
      capabilities: ['text'],
      available: true,
      source: 'config' as const,
    };

    const result = findModelsDevModel(modelInfo, modelsDevData);
    expect(result).toBeDefined();
    expect(result!.name).toBe('Claude 3 Opus');
  });

  test('should return null for no match', async () => {
    const modelsDevData = {
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          context_window: 128000,
          capabilities: ['text'],
          status: 'available',
        },
      ],
    };

    const modelInfo = {
      id: 'unknown/nonexistent-model',
      name: 'Nonexistent Model',
      provider: 'unknown',
      providerType: 'custom' as const,
      capabilities: [],
      available: true,
      source: 'config' as const,
    };

    const result = findModelsDevModel(modelInfo, modelsDevData);
    expect(result).toBeNull();
  });

  test('should enrich model with missing context window', async () => {
    const modelsDevData = {
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          context_window: 200000,
          max_output: 8192,
          input_price: 3,
          output_price: 15,
          capabilities: ['text', 'code', 'vision'],
          status: 'available',
        },
      ],
    };

    const modelInfo = {
      id: 'anthropic/claude-3-5-sonnet-20241022',
      name: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      providerType: 'anthropic' as const,
      capabilities: ['text'],
      available: true,
      source: 'config' as const,
    };

    const enriched = enrichModelFromDev(modelInfo, modelsDevData);
    expect(enriched.contextWindow).toBe(200000);
    expect(enriched.maxOutput).toBe(8192);
    expect(enriched.pricing?.input).toBe(3);
    expect(enriched.pricing?.output).toBe(15);
    expect(enriched.capabilities).toContain('vision');
  });

  test('should preserve original data when no enrichment needed', async () => {
    const modelsDevData = {
      models: [],
    };

    const originalModel = {
      id: 'anthropic/custom-model',
      name: 'Custom Model',
      provider: 'anthropic',
      providerType: 'anthropic' as const,
      contextWindow: 100000,
      maxOutput: 4000,
      pricing: { input: 1, output: 2 },
      capabilities: ['text', 'code'],
      available: true,
      source: 'config' as const,
    };

    const enriched = enrichModelFromDev(originalModel, modelsDevData);
    expect(enriched).toEqual(originalModel);
  });

  test('should get provider information', async () => {
    const modelsDevData = {
      providers: [
        {
          name: 'anthropic',
          type: 'anthropic',
          auth_method: 'api-key',
          base_url: 'https://api.anthropic.com',
        },
      ],
    };

    const provider = getModelsDevProvider('anthropic', modelsDevData);
    expect(provider).toBeDefined();
    expect(provider!.name).toBe('anthropic');
    expect(provider!.type).toBe('anthropic');
  });

  test('should get provider models', async () => {
    const modelsDevData = {
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          type: 'text',
          status: 'available',
        },
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          type: 'text',
          status: 'available',
        },
        {
          id: 'claude-3-5-haiku-20241022',
          name: 'Claude 3.5 Haiku',
          provider: 'anthropic',
          type: 'text',
          status: 'unavailable',
        },
      ],
    };

    const models = getModelsDevProviderModels('anthropic', 'anthropic', modelsDevData);
    expect(models).toHaveLength(2); // Only available models
    expect(models[0].name).toBe('Claude 3.5 Sonnet');
    expect(models[1].name).toBe('Claude 3 Opus');
  });

  test('should convert Models.dev model format', async () => {
    const devModel = {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      context_window: 200000,
      max_output: 8192,
      input_price: 3,
      output_price: 15,
      capabilities: ['text', 'code', 'vision'],
      status: 'available',
    };

    const converted = convertModelsDevModel(devModel, 'anthropic', 'anthropic');
    expect(converted.id).toBe('anthropic/claude-3-5-sonnet-20241022');
    expect(converted.name).toBe('Claude 3.5 Sonnet');
    expect(converted.provider).toBe('anthropic');
    expect(converted.contextWindow).toBe(200000);
    expect(converted.maxOutput).toBe(8192);
    expect(converted.pricing?.input).toBe(3);
    expect(converted.pricing?.output).toBe(15);
    expect(converted.capabilities).toContain('vision');
    expect(converted.available).toBe(true);
    expect(converted.source).toBe('models-dev');
  });

  test('should create synthetic models', async () => {
    const mockModelsDevData = {
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          context_window: 200000,
          status: 'available',
        },
      ],
    };

    spyOn({} as any, 'fetchModelsDevData').mockResolvedValue(mockModelsDevData);

    const syntheticModels = await createSyntheticModels('anthropic', 'anthropic', testWorktree);
    expect(syntheticModels).toHaveLength(1);
    expect(syntheticModels[0].name).toBe('Claude 3.5 Sonnet');
    expect(syntheticModels[0].provider).toBe('anthropic');
    expect(syntheticModels[0].source).toBe('models-dev');
  });

  test('should handle fetch errors for synthetic models', async () => {
    spyOn({} as any, 'fetchModelsDevData').mockRejectedValue(new Error('API error'));

    const syntheticModels = await createSyntheticModels('anthropic', 'anthropic', testWorktree);
    expect(syntheticModels).toHaveLength(0);
  });
});
