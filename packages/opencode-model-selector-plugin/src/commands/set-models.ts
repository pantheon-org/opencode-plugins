import { savePluginConfig } from '../config/loader';
import type { SetModelsArgs } from '../config/types';

export const handleSetModels = async (context: any, args: SetModelsArgs, config: any) => {
  const client = context.client;

  try {
    // Validate that models exist by attempting to fetch them
    // In a real implementation, you'd want to verify models are accessible

    const configUpdate = {
      models: {
        large: {
          provider: args.largeProvider,
          model: args.largeModel,
        },
        small: {
          provider: args.smallProvider,
          model: args.smallModel,
        },
      },
    };

    // Save configuration
    await savePluginConfig(context.worktree, configUpdate);

    // Show success message
    await client.tui.showToast({
      body: {
        title: 'Models Configured',
        message: `Large: ${args.largeModel} (${args.largeProvider}), Small: ${args.smallModel} (${args.smallProvider})`,
        variant: 'success',
        duration: 3000,
      },
    });

    return {
      success: true,
      output: `Set models: Large=${args.largeModel} (${args.largeProvider}), Small=${args.smallModel} (${args.smallProvider})`,
    };
  } catch (error) {
    console.error('[model-selector] set-models command failed:', error);

    return {
      success: false,
      output: `Failed to set models: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
