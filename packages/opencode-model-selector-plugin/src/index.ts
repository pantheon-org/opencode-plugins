import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin';
import { z } from 'zod';

import { discoverProviders } from './discovery/providers';
import { handleSelectModel, handleListModels, handleSetModels, handleDiscoverModels } from './commands';
import { loadPluginConfig } from './config/loader';
import { showModelSelector } from './ui/selector';

export const ModelSelectorPlugin: Plugin = async ({ client, worktree }) => {
  // Load plugin configuration
  const config = await loadPluginConfig(worktree);

  return {
    // Register custom tools/commands
    tool: {
      'select-model': tool({
        description: 'Interactive model selection for large and small models',
        args: {
          provider: z.string().optional().describe('Filter by provider name'),
          category: z.enum(['large', 'small']).optional().describe('Select specific category'),
          auto: z.boolean().optional().describe('Auto-select best model'),
        },
        execute: async (args, context) => {
          return (await handleSelectModel(context, args, config)).output;
        },
      }),

      'list-models': tool({
        description: 'List all available models with categorization',
        args: {
          provider: z.string().optional().describe('Filter by provider name'),
          category: z.enum(['large', 'small']).optional().describe('Filter by category'),
          format: z.enum(['table', 'json']).optional().describe('Output format'),
        },
        execute: async (args, context) => {
          return (await handleListModels(context, args, config)).output;
        },
      }),

      'set-models': tool({
        description: 'Directly set large and small model configuration',
        args: {
          largeProvider: z.string().describe('Provider for large model'),
          largeModel: z.string().describe('Large model ID'),
          smallProvider: z.string().describe('Provider for small model'),
          smallModel: z.string().describe('Small model ID'),
        },
        execute: async (args, context) => {
          return (await handleSetModels(context, args, config)).output;
        },
      }),

      'discover-models': tool({
        description: 'Force refresh model discovery from all sources',
        args: {
          forceApi: z.boolean().optional().describe('Force API discovery even if cache exists'),
          provider: z.string().optional().describe('Discover models for specific provider only'),
        },
        execute: async (args, context) => {
          return (await handleDiscoverModels(context, args, config)).output;
        },
      }),
    },

    // Event handlers
    event: async ({ event }) => {
      switch (event.type) {
        case 'session.created':
          // Auto-prompt for model selection if no configuration exists
          if (config.autoPrompt && !config.models?.large && !config.models?.small) {
            try {
              const providers = await discoverProviders();
              if (providers.length > 0) {
                await showModelSelector(client, {
                  type: 'initial-setup',
                  providers,
                  config,
                });
              }
            } catch (error: any) {
              console.error('[model-selector] Failed to auto-prompt model selection:', error);
            }
          }
          break;

        // Note: tool.execute.before is not a valid event type in OpenCode
        // Model switching logic would need to be implemented differently
        // For now, we'll just skip this functionality
      }
    },
  };
};

export default ModelSelectorPlugin;
