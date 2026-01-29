import { getCategoryStats } from '../classification/categorizer';
import type { ListModelsArgs } from '../config/types';
import { fetchAvailableModels, searchModels } from '../discovery/providers';
import { displayModelsList } from '../ui/selector';

export const handleListModels = async (context: any, args: ListModelsArgs, config: any) => {
  const client = context.client;

  try {
    let models = await fetchAvailableModels(context.worktree);

    // Filter by provider if specified
    if (args.provider) {
      models = models.filter((model: any) => model.provider.toLowerCase().includes(args.provider!.toLowerCase()));
    }

    // Filter by category if specified
    if (args.category) {
      const { filterModelsByCategory } = await import('../classification/categorizer');
      models = filterModelsByCategory(models, args.category, config.classification);
    }

    // Sort by availability first, then by provider, then by name
    models.sort((a: any, b: any) => {
      if (a.available !== b.available) {
        return b.available ? 1 : -1;
      }
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider);
      }
      return a.name.localeCompare(b.name);
    });

    // Display based on format
    await displayModelsList(client, models, args.format);

    // Show category statistics if not filtering by category
    if (!args.category) {
      const stats = getCategoryStats(models, config.classification);

      console.log('\n--- Model Categories ---');
      console.log(`Large models: ${stats.availableLarge}/${stats.large} available`);
      console.log(`Small models: ${stats.availableSmall}/${stats.small} available`);
      console.log(`Total: ${stats.available}/${stats.total} available`);
    }

    return {
      success: true,
      output: `Listed ${models.length} models${args.provider ? ` from ${args.provider}` : ''}${args.category ? ` (${args.category} category)` : ''}`,
    };
  } catch (error) {
    console.error('[model-selector] list-models command failed:', error);

    return {
      success: false,
      output: `Failed to list models: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
