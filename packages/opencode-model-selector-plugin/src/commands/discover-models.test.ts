import { describe, expect, test, spyOn } from 'bun:test';
import { handleDiscoverModels } from './discover-models';

describe('discover-models', () => {
  test('should handle full discovery workflow', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockProviders = [
      { name: 'anthropic', type: 'anthropic' as const, available: true },
      { name: 'openai', type: 'openai' as const, available: true }
    ];

    const mockModels = [
      { id: 'anthropic/claude-3-5-sonnet', name: 'claude-3-5-sonnet', provider: 'anthropic', available: true, source: 'api' as const, capabilities: [], providerType: 'anthropic' as const }
    ];

    spyOn({} as any, 'discoverProviders').mockResolvedValue(mockProviders);
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'saveCache').mockResolvedValue();

    const result = await handleDiscoverModels(mockContext, {}, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('Discovered');
    expect(result.output).toContain('2 models');
    expect(result.output).toContain('2 providers');
  });

  test('should handle provider-specific discovery', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockProviders = [
      { name: 'anthropic', type: 'anthropic' as const, available: true },
      { name: 'openai', type: 'openai' as const, available: true }
    ];

    const mockModels = [
      { id: 'anthropic/claude-3-5-sonnet', name: 'claude-3-5-sonnet', provider: 'anthropic', available: true, source: 'api' as const, capabilities: [], providerType: 'anthropic' as const }
    ];

    spyOn({} as any, 'discoverProviders').mockResolvedValue(mockProviders);
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'saveCache').mockResolvedValue();

    const result = await handleDiscoverModels(mockContext, { provider: 'anthropic' }, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('anthropic');
  });

  test('should handle force refresh flag', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockProviders = [
      { name: 'anthropic', type: 'anthropic' as const, available: true }
    ];

    const mockModels = [
      { id: 'anthropic/claude-3-5-sonnet', name: 'claude-3-5-sonnet', provider: 'anthropic', available: true, source: 'api' as const, capabilities: [], providerType: 'anthropic' as const }
    ];

    const mockCache = {
      models: {
        data: mockModels,
        timestamp: Date.now() - 3600000, // Expired
        ttl: 3600000
      }
    };

    spyOn({} as any, 'discoverProviders').mockResolvedValue(mockProviders);
    spyOn({} as any, 'loadCache').mockResolvedValue(mockCache);
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'saveCache').mockResolvedValue();

    const result = await handleDiscoverModels(mockContext, { forceApi: true }, {});
    expect(result.success).toBe(true);
    expect({} as any, 'loadCache).toHaveBeenCalled();
    expect({} as any, 'fetchAvailableModels').toHaveBeenCalledWith(mockContext.worktree, true);
  });

  test('should handle provider not found', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockProviders = [
      { name: 'anthropic', type: 'anthropic' as const, available: true }
    ];

    spyOn({} as any, 'discoverProviders').mockResolvedValue(mockProviders);

    const result = await handleDiscoverModels(mockContext, { provider: 'nonexistent' }, {});
    expect(result.success).toBe(false);
    expect(result.output).toContain('Provider "nonexistent" not found');
  });

  test('should handle discovery errors gracefully', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    spyOn({} as any, 'discoverProviders').mockRejectedValue(new Error('Discovery error'));

    const result = await handleDiscoverModels(mockContext, {}, {});
    expect(result.success).toBe(false);
    expect(result.output).toContain('Failed to discover models');
    expect(result.output).toContain('Discovery error');
  });

  test('should create synthetic models when no API access', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockProviders = [
      { name: 'newprovider', type: 'custom' as const, available: true }, // No API access
      { name: 'anthropic', type: 'anthropic' as const, available: true }
    ];

    const mockModels = [
      { id: 'anthropic/claude-3-5-sonnet', name: 'claude-3-5-sonnet', provider: 'anthropic', available: true, source: 'api' as const, capabilities: [], providerType: 'anthropic' as const }
    ];

    const mockSyntheticModels = [
      { id: 'newprovider/model-1', name: 'Model 1', provider: 'newprovider', available: true, source: 'models-dev' as const, capabilities: [], providerType: 'custom' as const }
    ];

    spyOn({} as any, 'discoverProviders').mockResolvedValue(mockProviders);
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'createSyntheticModels').mockResolvedValue(mockSyntheticModels);
    spyOn({} as any, 'saveCache').mockResolvedValue();

    const result = await handleDiscoverModels(mockContext, {}, {});
    expect(result.success).toBe(true);
    expect({} as any, 'createSyntheticModels').toHaveBeenCalledWith('newprovider', 'custom', mockContext.worktree);
    expect(result.output).toContain('2 models');
  });

  test('should log discovery progress', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockProviders = [
      { name: 'anthropic', type: 'anthropic' as const, available: true },
      { name: 'openai', type: 'openai' as const, available: false }
    ];

    const mockModels = [
      { id: 'anthropic/claude-3-5-sonnet', name: 'claude-3-5-sonnet', provider: 'anthropic', available: true, source: 'api' as const, capabilities: [], providerType: 'anthropic' as const }
    ];

    spyOn({} as any, 'discoverProviders').mockResolvedValue(mockProviders);
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'saveCache').mockResolvedValue();

    await handleDiscoverModels(mockContext, {}, {});
    
    expect(mockContext.client.log).toHaveBeenCalledWith('Discovering models...');
    expect(mockContext.client.log).toHaveBeenCalledWith('--- Provider Discovery Results ---');
    expect(mockContext.client.log).toHaveBeenCalledWith('anthropic: 1 models (1 available)');
    expect(mockContext.client.log).toHaveBeenCalledWith('openai: 0 models (0 available)');
  });
});