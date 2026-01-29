import { describe, expect, test, spyOn } from 'bun:test';
import {
  discoverProviders,
  fetchProviderModels,
  fetchAvailableModels,
  getModelsByProvider,
  searchModels,
} from './providers';

describe('providers', () => {
  const testWorktree = '/test-worktree';

  test('should discover providers from auth.json', async () => {
    const mockAuthConfig = {
      providers: {
        anthropic: { type: 'anthropic', apiKey: 'sk-test-anthropic' },
        openai: { type: 'openai', apiKey: 'sk-test-openai' },
        ollama: { type: 'ollama', baseURL: 'http://localhost:11434' },
      },
    };

    const mockFile = (path: string) => ({
      exists: () => Promise.resolve(path.includes('auth')),
      json: () => Promise.resolve(mockAuthConfig),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile as any);

    const providers = await discoverProviders();
    expect(providers).toHaveLength(3);
    expect(providers[0].name).toBe('anthropic');
    expect(providers[0].type).toBe('anthropic');
    expect(providers[0].available).toBe(true);
    expect(providers[1].name).toBe('openai');
    expect(providers[1].type).toBe('openai');
    expect(providers[1].available).toBe(true);
    expect(providers[2].name).toBe('ollama');
    expect(providers[2].type).toBe('ollama');
  });

  test('should merge providers from opencode.json', async () => {
    const mockAuthConfig = {
      providers: {
        anthropic: { type: 'anthropic', apiKey: 'sk-test' },
      },
    };

    const mockOpenCodeConfig = {
      provider: {
        google: {
          options: { baseURL: 'https://api.google.com', apiKey: 'google-key' },
          models: {
            'gemini-pro': { name: 'Gemini Pro', limit: { context: 1000000 } },
          },
        },
      },
    };

    const mockFile = (path: string) => ({
      exists: () => Promise.resolve(true),
      json: () => (path.includes('auth') ? mockAuthConfig : mockOpenCodeConfig),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile as any);

    const providers = await discoverProviders();
    expect(providers).toHaveLength(2);

    const anthropicProvider = providers.find((p) => p.name === 'anthropic');
    const googleProvider = providers.find((p) => p.name === 'google');

    expect(anthropicProvider?.type).toBe('anthropic');
    expect(anthropicProvider?.authLocation).toBe('auth.json');
    expect(googleProvider?.type).toBe('google');
    expect(googleProvider?.authLocation).toBe('opencode.json');
  });

  test('should deduplicate providers by name', async () => {
    const mockAuthConfig = {
      providers: {
        anthropic: { type: 'anthropic', apiKey: 'sk-test' },
      },
    };

    const mockOpenCodeConfig = {
      provider: {
        anthropic: {
          options: { baseURL: 'https://api.anthropic.com' },
          models: { 'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet' } },
        },
      },
    };

    const mockFile = (path: string) => ({
      exists: () => Promise.resolve(true),
      json: () => (path.includes('auth') ? mockAuthConfig : mockOpenCodeConfig),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile as any);

    const providers = await discoverProviders();
    const anthropicProviders = providers.filter((p) => p.name === 'anthropic');
    expect(anthropicProviders).toHaveLength(1); // Should only have one, not two
  });

  test('should handle missing configuration files', async () => {
    const mockFile = () => ({
      exists: () => Promise.resolve(false),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile as any);

    const providers = await discoverProviders();
    expect(providers).toHaveLength(0);
  });

  test('should fetch OpenAI models correctly', async () => {
    const mockOpenAIResponse = {
      data: [
        {
          id: 'gpt-4',
          object: 'model',
          context_window: 128000,
          max_tokens: 4096,
          capabilities: ['text', 'code', 'vision'],
        },
        {
          id: 'gpt-4o-mini',
          object: 'model',
          context_window: 128000,
          max_tokens: 16384,
          capabilities: ['text', 'code'],
        },
      ],
    };

    const mockFetch = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOpenAIResponse),
      } as Response);

    global.fetch = mockFetch;

    const provider = {
      type: 'openai' as const,
      name: 'openai',
      apiKey: 'sk-test',
      baseURL: 'https://api.openai.com/v1/models',
      available: true,
      authLocation: 'auth.json' as const,
    };

    const models = await fetchProviderModels(provider);
    expect(models).toHaveLength(2);
    expect(models[0].name).toBe('gpt-4');
    expect(models[0].contextWindow).toBe(128000);
    expect(models[0].maxOutput).toBe(4096);
    expect(models[0].capabilities).toContain('vision');
  });

  test('should fetch Anthropic known models', async () => {
    const provider = {
      type: 'anthropic' as const,
      name: 'anthropic',
      apiKey: 'sk-test',
      available: true,
      authLocation: 'auth.json' as const,
    };

    const models = await fetchProviderModels(provider);
    expect(models.length).toBeGreaterThan(0);

    const claude35Sonnet = models.find((m) => m.name.includes('claude-3-5-sonnet'));
    expect(claude35Sonnet).toBeDefined();
    expect(claude35Sonnet?.capabilities).toContain('code');
    expect(claude35Sonnet?.available).toBe(true);
  });

  test('should handle API errors gracefully', async () => {
    const mockFetch = () =>
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

    global.fetch = mockFetch;

    const provider = {
      type: 'openai' as const,
      name: 'openai',
      apiKey: 'invalid-key',
      baseURL: 'https://api.openai.com/v1/models',
      available: true,
      authLocation: 'auth.json' as const,
    };

    const models = await fetchProviderModels(provider);
    expect(models).toHaveLength(0);
  });

  test('should filter models by provider', async () => {
    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        available: true,
        source: 'api' as const,
        capabilities: [],
        providerType: 'openai' as const,
      },
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        available: true,
        source: 'api' as const,
        capabilities: [],
        providerType: 'anthropic' as const,
      },
      {
        id: 'google/gemini-pro',
        name: 'gemini-pro',
        provider: 'google',
        available: true,
        source: 'api' as const,
        capabilities: [],
        providerType: 'google' as const,
      },
    ];

    // Mock the fetchAvailableModels function's cache loading
    const mockCache = { models: { data: mockModels, timestamp: Date.now(), ttl: 3600000 } };
    spyOn({} as any, 'loadCache').mockResolvedValue(mockCache);

    const openaiModels = await getModelsByProvider(testWorktree, 'openai');
    expect(openaiModels).toHaveLength(1);
    expect(openaiModels[0].provider).toBe('openai');
  });

  test('should search models by name', async () => {
    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        available: true,
        source: 'api' as const,
        capabilities: ['vision'],
        providerType: 'openai' as const,
      },
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        available: true,
        source: 'api' as const,
        capabilities: ['code'],
        providerType: 'anthropic' as const,
      },
    ];

    const mockCache = { models: { data: mockModels, timestamp: Date.now(), ttl: 3600000 } };
    spyOn({} as any, 'loadCache').mockResolvedValue(mockCache);

    const searchResults = await searchModels(testWorktree, 'gpt-4');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('gpt-4');
  });

  test('should search models by capability', async () => {
    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        available: true,
        source: 'api' as const,
        capabilities: ['vision', 'code'],
        providerType: 'openai' as const,
      },
      {
        id: 'anthropic/claude-3-5-haiku',
        name: 'claude-3-5-haiku',
        provider: 'anthropic',
        available: true,
        source: 'api' as const,
        capabilities: ['code'],
        providerType: 'anthropic' as const,
      },
    ];

    const mockCache = { models: { data: mockModels, timestamp: Date.now(), ttl: 3600000 } };
    spyOn({} as any, 'loadCache').mockResolvedValue(mockCache);

    const searchResults = await searchModels(testWorktree, 'vision');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('gpt-4');
    expect(searchResults[0].capabilities).toContain('vision');
  });

  test('should handle empty search results', async () => {
    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        available: true,
        source: 'api' as const,
        capabilities: [],
        providerType: 'openai' as const,
      },
    ];

    const mockCache = { models: { data: mockModels, timestamp: Date.now(), ttl: 3600000 } };
    spyOn({} as any, 'loadCache').mockResolvedValue(mockCache);

    const searchResults = await searchModels(testWorktree, 'nonexistent-model');
    expect(searchResults).toHaveLength(0);
  });
});
