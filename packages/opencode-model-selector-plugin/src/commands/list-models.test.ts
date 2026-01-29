import { describe, expect, test, spyOn } from 'bun:test';
import { handleListModels } from './list-model';

describe('list-models', () => {
  test('should list all available models', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 128000,
        capabilities: ['text', 'code', 'vision'],
        available: true,
        source: 'api' as const
      },
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        contextWindow: 200000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const
      }
    ];

    spyOn({} as any, 'displayModelsList').mockResolvedValue();
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'getCategoryStats').mockReturnValue({
      total: 2,
      large: 1,
      small: 1,
      available: 2,
      availableLarge: 1,
      availableSmall: 1
    });

    const result = await handleListModels(mockContext, {}, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('Listed 2 models');
  });

  test('should filter models by provider', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const
      },
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const
      }
    ];

    const filteredModels = [mockModels[0]]; // Only OpenAI

    spyOn({} as any, 'displayModelsList').mockResolvedValue();
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'getCategoryStats').mockReturnValue({
      total: 1,
      large: 0,
      small: 1,
      available: 1,
      availableLarge: 0,
      availableSmall: 1
    });

    const result = await handleListModels(mockContext, { provider: 'openai' }, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('from openai');
  });

  test('should filter models by category', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
        category: 'large' as const
      },
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'gpt-3.5-turbo',
        provider: 'openai',
        providerType: 'openai' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
        category: 'small' as const
      }
    ];

    const filteredModels = [mockModels[0]]; // Only large model

    spyOn({} as any, 'displayModelsList').mockResolvedValue();
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'filterModelsByCategory').mockReturnValue(filteredModels);
    spyOn({} as any, 'getCategoryStats').mockReturnValue({
      total: 1,
      large: 1,
      small: 0,
      available: 1,
      availableLarge: 1,
      availableSmall: 0
    });

    const result = await handleListModels(mockContext, { category: 'large' }, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('large category');
  });

  test('should display JSON format', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const
      }
    ];

    spyOn({} as any, 'displayModelsList').mockResolvedValue();
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'getCategoryStats').mockReturnValue({
      total: 1,
      large: 0,
      small: 1,
      available: 1,
      availableLarge: 0,
      availableSmall: 1
    });

    const result = await handleListModels(mockContext, { format: 'json' }, {});
    expect(result.success).toBe(true);
    expect({} as any, 'displayModelsList).toHaveBeenCalledWith(
      mockContext.client,
      mockModels,
      'json'
    );
  });

  test('should handle empty model list', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    spyOn({} as any, 'displayModelsList').mockResolvedValue();
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue([]);
    spyOn({} as any, 'getCategoryStats').mockReturnValue({
      total: 0,
      large: 0,
      small: 0,
      available: 0,
      availableLarge: 0,
      availableSmall: 0
    });

    const result = await handleListModels(mockContext, {}, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('Listed 0 models');
  });

  test('should handle fetch errors gracefully', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    spyOn({} as any, 'fetchAvailableModels').mockRejectedValue(new Error('Network error'));

    const result = await handleListModels(mockContext, {}, {});
    expect(result.success).toBe(false);
    expect(result.output).toContain('Failed to list models');
    expect(result.output).toContain('Network error');
  });

  test('should show statistics when not filtering by category', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        log: jest.fn()
      }
    };

    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const
      }
    ];

    spyOn({} as any, 'displayModelsList').mockResolvedValue();
    spyOn({} as any, 'fetchAvailableModels').mockResolvedValue(mockModels);
    spyOn({} as any, 'getCategoryStats').mockReturnValue({
      total: 1,
      large: 1,
      small: 0,
      available: 1,
      availableLarge: 1,
      availableSmall: 0
    });

    await handleListModels(mockContext, {}, {});
    expect({} as any, 'getCategoryStats').toHaveBeenCalledWith(mockModels, {});
    expect({} as any, 'displayModelsList').toHaveBeenCalledWith(
      mockContext.client,
      mockModels,
      'table'
    );
  });
});