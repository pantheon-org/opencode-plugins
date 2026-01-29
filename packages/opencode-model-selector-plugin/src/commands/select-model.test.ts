import { describe, expect, test, spyOn } from 'bun:test';
import { handleSelectModel } from './select-model';

describe('select-model', () => {
  test('should handle successful model selection', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({ value: 'confirm' }) },
          showToast: () => Promise.resolve(),
        },
      },
    };

    const mockModels = [
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
    ];

    spyOn({} as any, 'showModelSelector').mockResolvedValue({
      large: mockModels[0],
      small: null,
    });

    spyOn({} as any, 'showModelConfirmation').mockResolvedValue(true);
    spyOn({} as any, 'savePluginConfig').mockResolvedValue();
    spyOn({} as any, 'saveModelSelection').mockResolvedValue();

    const result = await handleSelectModel(mockContext, {}, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('claude-3-5-sonnet-20241022');
  });

  test('should filter models by provider', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({ value: 'confirm' }) },
          showToast: () => Promise.resolve(),
        },
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
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
    ];

    const filteredModels = [mockModels[0]]; // Only Anthropic model

    spyOn({} as any, 'showModelSelector').mockResolvedValue({
      large: filteredModels[0],
      small: null,
    });

    spyOn({} as any, 'showModelConfirmation').mockResolvedValue(true);
    spyOn({} as any, 'savePluginConfig').mockResolvedValue();
    spyOn({} as any, 'saveModelSelection').mockResolvedValue();

    const result = await handleSelectModel(mockContext, { provider: 'anthropic' }, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('claude-3-5-sonnet');
  });

  test('should handle selection cancellation', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({ value: 'confirm' }) },
          showToast: () => Promise.resolve(),
        },
      },
    };

    spyOn({} as any, 'showModelSelector').mockResolvedValue({
      large: null,
      small: null,
    });

    spyOn({} as any, 'showModelConfirmation').mockResolvedValue(false); // Cancelled

    const result = await handleSelectModel(mockContext, {}, {});
    expect(result.success).toBe(false);
    expect(result.output).toContain('cancelled');
  });

  test('should handle no models selected', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({ value: 'confirm' }) },
          showToast: () => Promise.resolve(),
        },
      },
    };

    spyOn({} as any, 'showModelSelector').mockResolvedValue({
      large: null,
      small: null,
    });

    const result = await handleSelectModel(mockContext, {}, {});
    expect(result.success).toBe(false);
    expect(result.output).toBe('No models selected');
  });

  test('should handle save errors gracefully', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({ value: 'confirm' }) },
          showToast: () => Promise.resolve(),
        },
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

    spyOn({} as any, 'showModelSelector').mockResolvedValue({
      large: mockModels[0],
      small: null,
    });

    spyOn({} as any, 'showModelConfirmation').mockResolvedValue(true);
    spyOn({} as any, 'savePluginConfig').mockRejectedValue(new Error('File system error'));

    const result = await handleSelectModel(mockContext, {}, {});
    expect(result.success).toBe(false);
    expect(result.output).toContain('Failed to select models');
  });

  test('should show success toast', async () => {
    let toastShown = false;
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({ value: 'confirm' }) },
          showToast: () => {
            toastShown = true;
            return Promise.resolve();
          },
        },
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

    spyOn({} as any, 'showModelSelector').mockResolvedValue({
      large: mockModels[0],
      small: null,
    });

    spyOn({} as any, 'showModelConfirmation').mockResolvedValue(true);
    spyOn({} as any, 'savePluginConfig').mockResolvedValue();
    spyOn({} as any, 'saveModelSelection').mockResolvedValue();

    await handleSelectModel(mockContext, {}, {});
    expect(toastShown).toBe(true);
  });
});
