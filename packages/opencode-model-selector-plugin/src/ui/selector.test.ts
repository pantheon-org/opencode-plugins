import { describe, expect, test, spyOn } from 'bun:test';
import { showModelSelector, displayModelsList, showModelConfirmation } from './selector';
import '../test-setup.js';

describe('selector', () => {
  test('should show initial setup for new users', async () => {
    const promptAppend = jest.fn().mockResolvedValue({ value: 'manual' });
    const showToast = () => Promise.resolve();
    
    const mockClient = {
      worktree: '/test',
      tui: {
        prompt: { append: promptAppend },
        showToast
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

    const result = await showModelSelector(mockClient, {
      type: 'initial-setup',
      models: mockModels,
      config: { autoPrompt: true }
    });

    expect(result).toBeDefined();
    expect(promptAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'select',
        title: 'Model Selection'
      })
    );
  });

    expect(result).toBeDefined();
    expect(mockClient.tui.prompt.append).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'select',
        title: 'Model Selection',
      }),
    );
  });

  test('should show manual selection interface', async () => {
    const mockClient = {
      worktree: '/test',
      tui: {
        prompt: { append: () => Promise.resolve({ value: 'claude-3-5-sonnet' }) },
        showToast: () => Promise.resolve(),
      },
    };

    const mockModels = [
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
    ];

    const result = await showModelSelector(mockClient, {
      type: 'manual-select',
      models: mockModels,
      category: 'large',
    });

    expect(result).toBeDefined();
    expect(result.large?.name).toBe('claude-3-5-sonnet');
  });

  test('should handle empty model lists', async () => {
    const mockClient = {
      worktree: '/test',
      tui: {
        prompt: { append: () => Promise.resolve({ value: 'manual' }) },
        showToast: (options: any) => {
          expect(options.body.title).toBe('No Models Available');
          return Promise.resolve();
        },
      },
    };

    const result = await showModelSelector(mockClient, {
      type: 'manual-select',
      models: [],
      config: {},
    });

    expect(result.large).toBeNull();
    expect(result.small).toBeNull();
  });

  test('should handle TUI errors gracefully', async () => {
    const mockClient = {
      worktree: '/test',
      tui: {
        prompt: { append: () => Promise.reject(new Error('TUI error')) },
        showToast: () => Promise.resolve(),
      },
    };

    const result = await showModelSelector(mockClient, {
      type: 'manual-select',
      models: [],
      config: {},
    });

    expect(result.large).toBeNull();
    expect(result.small).toBeNull();
  });

  test('should display models list in table format', async () => {
    const mockClient = {
      worktree: '/test',
      log: jest.fn(),
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
        source: 'api' as const,
      },
      {
        id: 'anthropic/claude-3-5-haiku',
        name: 'claude-3-5-haiku',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        contextWindow: 200000,
        capabilities: ['text', 'code'],
        available: false,
        source: 'api' as const,
      },
    ];

    await displayModelsList(mockClient, mockModels, 'table');

    expect(mockClient.log).toHaveBeenCalledWith('\nModel Name | Provider | Context | Capabilities | Available');
    expect(mockClient.log).toHaveBeenCalledWith('gpt-4 | openai | 128,000 | text, code, vision | ✓');
    expect(mockClient.log).toHaveBeenCalledWith('claude-3-5-haiku | anthropic | 200,000 | text, code | ✗');
    expect(mockClient.log).toHaveBeenCalledWith('\nTotal models: 2 (1 available)');
  });

  test('should display models list in JSON format', async () => {
    const mockClient = {
      worktree: '/test',
      log: jest.fn(),
    };

    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 128000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
    ];

    await displayModelsList(mockClient, mockModels, 'json');

    expect(mockClient.log).toHaveBeenCalledWith(JSON.stringify(mockModels, null, 2));
  });

  test('should show model confirmation dialog', async () => {
    const mockClient = {
      worktree: '/test',
      tui: {
        prompt: { append: () => Promise.resolve({ value: 'confirm' }) },
      },
    };

    const selected = {
      large: {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
      small: {
        id: 'anthropic/claude-3-5-haiku',
        name: 'claude-3-5-haiku',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
    };

    const result = await showModelConfirmation(mockClient, selected);

    expect(result).toBe(true);
    expect(mockClient.tui.prompt.append).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'select',
        title: 'Confirm Model Selection',
      }),
    );
  });

  test('should handle confirmation cancellation', async () => {
    const mockClient = {
      worktree: '/test',
      tui: {
        prompt: { append: () => Promise.resolve({ value: 'cancel' }) },
      },
    };

    const selected = {
      large: {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
      small: null,
    };

    const result = await showModelConfirmation(mockClient, selected);

    expect(result).toBe(false);
  });

  test('should format model options correctly', async () => {
    const mockClient = {
      worktree: '/test',
      tui: {
        prompt: { append: jest.fn().mockResolvedValue({ value: 'gpt-4' }) },
      },
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
        source: 'api' as const,
      },
    ];

    await showModelSelector(mockClient, {
      type: 'manual-select',
      models: mockModels,
      category: 'large',
    });

    const call = mockClient.tui.prompt.append.mock.calls[0];
    const options = call[0][1]?.options;

    expect(options).toBeDefined();
    expect(options[0]).toEqual(
      expect.objectContaining({
        value: 'openai/gpt-4',
        label: 'gpt-4 (openai)',
        description: 'Context: 128,000 tokens | text, code, vision',
      }),
    );
  });

  test('should filter models by category for selection', async () => {
    const mockClient = {
      worktree: '/test',
      tui: {
        prompt: { append: jest.fn().mockResolvedValue({ value: 'claude-3-5-haiku' }) },
      },
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
        source: 'api' as const,
      },
      {
        id: 'anthropic/claude-3-5-haiku',
        name: 'claude-3-5-haiku',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        contextWindow: 200000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
    ];

    await showModelSelector(mockClient, {
      type: 'manual-select',
      models: mockModels,
      category: 'small',
    });

    const call = mockClient.tui.prompt.append.mock.calls[1];
    const options = call[0][1]?.options;

    // Should only show small models in the second prompt
    expect(options).toBeDefined();
    expect(options[0]?.value).toBe('anthropic/claude-3-5-haiku');
  });
});
