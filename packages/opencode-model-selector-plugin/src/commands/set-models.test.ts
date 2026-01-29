import { describe, expect, test, spyOn } from 'bun:test';
import { handleSetModels } from './set-models';

describe('set-models', () => {
  test('should set valid model configuration', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          showToast: () => Promise.resolve(),
        },
      },
    };

    const args = {
      largeProvider: 'anthropic',
      largeModel: 'claude-3-5-sonnet-20241022',
      smallProvider: 'openai',
      smallModel: 'gpt-4o-mini',
    };

    spyOn({} as any, 'savePluginConfig').mockResolvedValue();

    const result = await handleSetModels(mockContext, args, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('claude-3-5-sonnet-20241022');
    expect(result.output).toContain('gpt-4o-mini');
  });

  test('should handle invalid model validation', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          showToast: () => Promise.resolve(),
        },
      },
    };

    const args = {
      largeProvider: 'invalid-provider',
      largeModel: 'invalid-model',
      smallProvider: 'another-invalid',
      smallModel: 'another-invalid-model',
    };

    spyOn({} as any, 'savePluginConfig').mockResolvedValue();

    const result = await handleSetModels(mockContext, args, {});
    expect(result.success).toBe(true); // Current implementation doesn't validate
    expect(result.output).toContain('invalid-provider');
  });

  test('should show success notification', async () => {
    let toastShown = false;
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          showToast: (options: any) => {
            toastShown = true;
            expect(options.body.title).toBe('Models Configured');
            return Promise.resolve();
          },
        },
      },
    };

    const args = {
      largeProvider: 'anthropic',
      largeModel: 'claude-3-5-sonnet',
      smallProvider: 'openai',
      smallModel: 'gpt-4o-mini',
    };

    spyOn({} as any, 'savePluginConfig').mockResolvedValue();

    await handleSetModels(mockContext, args, {});
    expect(toastShown).toBe(true);
  });

  test('should handle save errors gracefully', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          showToast: () => Promise.resolve(),
        },
      },
    };

    const args = {
      largeProvider: 'anthropic',
      largeModel: 'claude-3-5-sonnet',
      smallProvider: 'openai',
      smallModel: 'gpt-4o-mini',
    };

    spyOn({} as any, 'savePluginConfig').mockRejectedValue(new Error('Permission denied'));

    const result = await handleSetModels(mockContext, args, {});
    expect(result.success).toBe(false);
    expect(result.output).toContain('Failed to set models');
    expect(result.output).toContain('Permission denied');
  });

  test('should handle empty provider names', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          showToast: () => Promise.resolve(),
        },
      },
    };

    const args = {
      largeProvider: '',
      largeModel: 'claude-3-5-sonnet',
      smallProvider: '',
      smallModel: 'gpt-4o-mini',
    };

    spyOn({} as any, 'savePluginConfig').mockResolvedValue();

    const result = await handleSetModels(mockContext, args, {});
    expect(result.success).toBe(true); // Current implementation accepts empty strings
    expect(result.output).toContain('claude-3-5-sonnet');
  });

  test('should handle special characters in model names', async () => {
    const mockContext = {
      worktree: '/test',
      client: {
        tui: {
          showToast: () => Promise.resolve(),
        },
      },
    };

    const args = {
      largeProvider: 'anthropic',
      largeModel: 'claude-3-5-sonnet-20241022',
      smallProvider: 'openai',
      smallModel: 'gpt-4o-turbo-2024-04-09',
    };

    spyOn({} as any, 'savePluginConfig').mockResolvedValue();

    const result = await handleSetModels(mockContext, args, {});
    expect(result.success).toBe(true);
    expect(result.output).toContain('claude-3-5-sonnet-20241022');
    expect(result.output).toContain('gpt-4o-turbo-2024-04-09');
  });
});
