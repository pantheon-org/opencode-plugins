import { savePluginConfig, saveModelSelection } from '../config/loader';
import type { SelectModelArgs } from '../config/types';
import { fetchAvailableModels } from '../discovery/providers';
import { showModelSelector, showModelConfirmation } from '../ui/selector';

export const handleSelectModel = async (context: any, args: SelectModelArgs, config: any) => {
  const client = context.client;

  try {
    const models = await fetchAvailableModels(context.worktree);
    let filteredModels = models;

    // Filter by provider if specified
    if (args.provider) {
      filteredModels = models.filter((model: any) =>
        model.provider.toLowerCase().includes(args.provider!.toLowerCase()),
      );
    }

    // Show selector
    const result = await showModelSelector(client, {
      type: 'manual-select',
      models: filteredModels,
      category: args.category,
      config,
    });

    if (!result.large && !result.small) {
      return {
        success: false,
        output: 'No models selected',
      };
    }

    // Show confirmation
    const confirmed = await showModelConfirmation(client, result);

    if (!confirmed) {
      return {
        success: false,
        output: 'Model selection cancelled',
      };
    }

    // Save configuration
    const configUpdate: any = {};

    if (result.large) {
      configUpdate.models = {
        ...config.models,
        large: {
          provider: result.large.provider,
          model: result.large.name,
        },
      };
    }

    if (result.small) {
      configUpdate.models = {
        ...(configUpdate.models || config.models),
        small: {
          provider: result.small.provider,
          model: result.small.name,
        },
      };
    }

    await savePluginConfig(context.worktree, configUpdate);
    const modelSelection = { ...result, timestamp: Date.now() };
    await saveModelSelection(context.worktree, modelSelection);

    // Show success message
    await client.tui.showToast({
      body: {
        title: 'Models Updated',
        message: `Selected ${result.large ? result.large.name : ''}${result.large && result.small ? ' + ' : ''}${result.small ? result.small.name : ''}`,
        variant: 'success',
        duration: 3000,
      },
    });

    return {
      success: true,
      output: `Selected models: ${result.large?.name || 'None'} (large), ${result.small?.name || 'None'} (small)`,
    };
  } catch (error) {
    console.error('[model-selector] select-model command failed:', error);

    return {
      success: false,
      output: `Failed to select models: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
