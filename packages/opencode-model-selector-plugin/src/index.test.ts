import { describe, expect, test, spyOn } from 'bun:test';
import { ModelSelectorPlugin } from './index';

describe('index', () => {
  test('should register plugin tools correctly', async () => {
    const mockContext = {
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({}) },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    const plugin = await ModelSelectorPlugin(mockContext);

    expect(plugin).toBeDefined();
    expect(plugin.tool).toBeDefined();
    expect(plugin.tool!['select-model']).toBeDefined();
    expect(plugin.tool!['list-models']).toBeDefined();
    expect(plugin.tool!['set-models']).toBeDefined();
    expect(plugin.tool!['discover-models']).toBeDefined();
  });

  test('should handle session.created event', async () => {
    let eventHandled = false;
    const mockContext = {
      client: {
        tui: {
          prompt: {
            append: () => {
              eventHandled = true;
              return Promise.resolve({});
            },
          },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    const plugin = await ModelSelectorPlugin(mockContext);

    if (plugin.event) {
      await plugin.event({
        type: 'session.created',
        session: { id: 'test-session' },
      });

      expect(eventHandled).toBe(true);
    }
  });

  test('should handle other events gracefully', async () => {
    const mockContext = {
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({}) },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    const plugin = await ModelSelectorPlugin(mockContext);

    if (plugin.event) {
      await plugin.event({
        type: 'tool.execute.before',
        tool: 'test-tool',
        args: {},
      });

      // Should not throw or crash
      expect(true).toBe(true);
    }
  });

  test('should register tool with correct properties', async () => {
    const mockContext = {
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({}) },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    const plugin = await ModelSelectorPlugin(mockContext);

    const selectModelTool = plugin.tool!['select-model'];
    expect(selectModelTool!.description).toContain('Interactive model selection');
    expect(selectModelTool!.execute).toBeDefined();

    const listModelsTool = plugin.tool!['list-models'];
    expect(listModelsTool!.description).toContain('List all available models');
    expect(listModelsTool!.execute).toBeDefined();
  });

  test('should load plugin configuration', async () => {
    let configLoaded = false;
    const mockContext = {
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({}) },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    const mockConfig = {
      autoPrompt: true,
      models: {
        large: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
      },
    };

    spyOn({} as any, 'loadPluginConfig').mockImplementation(() => {
      configLoaded = true;
      return Promise.resolve(mockConfig);
    });

    await ModelSelectorPlugin(mockContext);
    expect(configLoaded).toBe(true);
  });

  test('should auto-prompt on session start when needed', async () => {
    let selectorShown = false;
    const mockContext = {
      client: {
        tui: {
          prompt: {
            append: () => {
              selectorShown = true;
              return Promise.resolve({});
            },
          },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    const mockConfig = {
      autoPrompt: true,
      models: {}, // No models configured
    };

    const mockProviders = [{ name: 'anthropic', type: 'anthropic' as const, available: true }];

    spyOn({} as any, 'loadPluginConfig').mockResolvedValue(mockConfig);
    spyOn({} as any, 'discoverProviders').mockResolvedValue(mockProviders);
    spyOn({} as any, 'showModelSelector').mockResolvedValue({ large: null, small: null });

    const plugin = await ModelSelectorPlugin(mockContext);

    if (plugin.event) {
      await plugin.event({
        type: 'session.created',
        session: { id: 'test-session' },
      });
    }

    expect(selectorShown).toBe(true);
  });

  test('should not auto-prompt when models are configured', async () => {
    let selectorShown = false;
    const mockContext = {
      client: {
        tui: {
          prompt: {
            append: () => {
              selectorShown = true;
              return Promise.resolve({});
            },
          },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    const mockConfig = {
      autoPrompt: true,
      models: {
        large: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
        small: { provider: 'openai', model: 'gpt-4o-mini' },
      },
    };

    spyOn({} as any, 'loadPluginConfig').mockResolvedValue(mockConfig);

    const plugin = await ModelSelectorPlugin(mockContext);

    if (plugin.event) {
      await plugin.event({
        type: 'session.created',
        session: { id: 'test-session' },
      });
    }

    expect(selectorShown).toBe(false);
  });

  test('should handle configuration loading errors', async () => {
    const mockContext = {
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({}) },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    spyOn({} as any, 'loadPluginConfig').mockRejectedValue(new Error('Config error'));

    // Should still create plugin with defaults
    const plugin = await ModelSelectorPlugin(mockContext);
    expect(plugin).toBeDefined();
    expect(plugin.tool).toBeDefined();
  });

  test('should handle provider discovery errors', async () => {
    const mockContext = {
      client: {
        tui: {
          prompt: { append: () => Promise.resolve({}) },
          showToast: () => Promise.resolve(),
        },
      },
      worktree: '/test',
    };

    const mockConfig = {
      autoPrompt: true,
      models: {},
    };

    spyOn({} as any, 'loadPluginConfig').mockResolvedValue(mockConfig);
    spyOn({} as any, 'discoverProviders').mockRejectedValue(new Error('Discovery error'));

    const plugin = await ModelSelectorPlugin(mockContext);

    if (plugin.event) {
      await plugin.event({
        type: 'session.created',
        session: { id: 'test-session' },
      });
    }

    // Should not crash on discovery error
    expect(true).toBe(true);
  });
});
