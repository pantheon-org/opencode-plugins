import { getOptimalModelPair } from '../classification/categorizer';
import type { ModelInfo, SelectionOptions, PluginConfig } from '../config/types';
import { fetchAvailableModels } from '../discovery/providers';

// Show interactive model selection interface
export const showModelSelector = async (
  client: any,
  options: SelectionOptions,
): Promise<{ large: ModelInfo | null; small: ModelInfo | null }> => {
  const { type, providers, models, category, config } = options;

  try {
    // Get available models if not provided
    const availableModels = models || (await fetchAvailableModels(client.worktree));
    const availableModelsWithCategory = availableModels.filter((model: any) => model.available);

    if (availableModelsWithCategory.length === 0) {
      await client.tui.showToast({
        body: {
          title: 'No Models Available',
          message: 'No models are currently available. Please check your provider configuration.',
          variant: 'error',
          duration: 5000,
        },
      });

      return { large: null, small: null };
    }

    // Show different interfaces based on selection type
    switch (type) {
      case 'initial-setup':
        return await showInitialSetupSelector(client, availableModelsWithCategory, config);

      case 'manual-select':
        return await showManualSelector(client, availableModelsWithCategory, category);

      case 'change-category':
        return await showCategorySelector(client, availableModelsWithCategory, category!);

      default:
        return await showManualSelector(client, availableModelsWithCategory, category);
    }
  } catch (error) {
    console.error('[model-selector] Failed to show model selector:', error);

    await client.tui.showToast({
      body: {
        title: 'Selection Failed',
        message: `Failed to show model selector: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'error',
        duration: 5000,
      },
    });

    return { large: null, small: null };
  }
};

// Initial setup selector for new users
const showInitialSetupSelector = async (
  client: any,
  models: ModelInfo[],
  config?: PluginConfig,
): Promise<{ large: ModelInfo | null; small: ModelInfo | null }> => {
  // Auto-select optimal pair first
  const optimal = getOptimalModelPair(models, config?.classification);

  if (optimal.large && optimal.small) {
    const result = await client.tui.prompt.append({
      title: 'Model Selection',
      message: "We've selected optimal models for your session. Would you like to use these or choose manually?",
      type: 'select',
      options: [
        {
          value: 'auto',
          label: `Use auto-selected: ${optimal.large.name} + ${optimal.small.name}`,
          description: 'Recommended optimal combination',
        },
        {
          value: 'manual',
          label: 'Choose models manually',
          description: 'Select from all available models',
        },
      ],
    });

    if (result?.value === 'auto') {
      return optimal;
    }
  }

  // Fall back to manual selection
  return await showManualSelector(client, models);
};

// Manual model selection
const showManualSelector = async (
  client: any,
  models: ModelInfo[],
  category?: 'large' | 'small',
): Promise<{ large: ModelInfo | null; small: ModelInfo | null }> => {
  let selectedLarge: ModelInfo | null = null;
  let selectedSmall: ModelInfo | null = null;

  // Select large model first (unless only selecting small)
  if (!category || category === 'large') {
    const largeModelOptions = models
      .filter(
        (model: any) =>
          model.id.includes('gpt-4') ||
          model.id.includes('claude-3-5-sonnet') ||
          model.id.includes('claude-3-opus') ||
          model.id.includes('gemini-pro') ||
          (model.contextWindow && model.contextWindow >= 100000),
      )
      .map((model: any) => ({
        value: model.id,
        label: `${model.name} (${model.provider})`,
        description: model.contextWindow
          ? `Context: ${model.contextWindow.toLocaleString()} tokens | ${model.capabilities.join(', ')}`
          : `Capabilities: ${model.capabilities.join(', ')}`,
      }));

    if (largeModelOptions.length > 0) {
      const largeResult = await client.tui.prompt.append({
        title: 'Select Large Model',
        message: 'Choose your large model for complex tasks:',
        type: 'select',
        options: largeModelOptions,
      });

      if (largeResult?.value) {
        selectedLarge = models.find((m: any) => m.id === largeResult.value) || null;
      }
    }
  }

  // Select small model
  if (!category || category === 'small') {
    const smallModelOptions = models
      .filter(
        (model: any) =>
          model.id.includes('gpt-3.5') ||
          model.id.includes('claude-3-haiku') ||
          model.id.includes('gemini-flash') ||
          (model.contextWindow && model.contextWindow < 100000),
      )
      .map((model: any) => ({
        value: model.id,
        label: `${model.name} (${model.provider})`,
        description: model.contextWindow
          ? `Context: ${model.contextWindow.toLocaleString()} tokens | ${model.capabilities.join(', ')}`
          : `Capabilities: ${model.capabilities.join(', ')}`,
      }));

    if (smallModelOptions.length > 0) {
      const smallResult = await client.tui.prompt.append({
        title: 'Select Small Model',
        message: 'Choose your small model for quick tasks:',
        type: 'select',
        options: smallModelOptions,
      });

      if (smallResult?.value) {
        selectedSmall = models.find((m: any) => m.id === smallResult.value) || null;
      }
    }
  }

  return { large: selectedLarge, small: selectedSmall };
};

// Category-specific selector
const showCategorySelector = async (
  client: any,
  models: ModelInfo[],
  category: 'large' | 'small',
): Promise<{ large: ModelInfo | null; small: ModelInfo | null }> => {
  return await showManualSelector(client, models, category);
};

// Display models list in formatted table
export const displayModelsList = async (
  client: any,
  models: ModelInfo[],
  format: 'table' | 'json' = 'table',
): Promise<void> => {
  if (format === 'json') {
    console.log(JSON.stringify(models, null, 2));
    return;
  }

  // Table format
  const header = ['Model Name', 'Provider', 'Context', 'Capabilities', 'Available'];
  const rows = models.map((model: any) => [
    model.name,
    model.provider,
    model.contextWindow ? `${model.contextWindow.toLocaleString()}` : 'N/A',
    model.capabilities.slice(0, 3).join(', '),
    model.available ? '✓' : '✗',
  ]);

  console.log('\n' + header.join(' | '));
  console.log('-'.repeat(header.join(' | ').length));

  for (const row of rows) {
    console.log(row.join(' | '));
  }

  console.log(`\nTotal models: ${models.length} (${models.filter((m: any) => m.available).length} available)`);
};

// Show model selection confirmation
export const showModelConfirmation = async (
  client: any,
  selected: { large: ModelInfo | null; small: ModelInfo | null },
): Promise<boolean> => {
  const confirmation = await client.tui.prompt.append({
    title: 'Confirm Model Selection',
    message: 'Review your selected models:',
    type: 'select',
    options: [
      {
        value: 'confirm',
        label: 'Confirm and save',
        description:
          selected.large && selected.small
            ? `Large: ${selected.large.name}, Small: ${selected.small.name}`
            : 'Save selected models',
      },
      {
        value: 'cancel',
        label: 'Cancel',
        description: 'Return to selection',
      },
    ],
  });

  return confirmation?.value === 'confirm';
};
