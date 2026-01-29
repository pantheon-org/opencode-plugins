import { loadCache, saveCache, setCacheEntry } from '../config/loader';
import type { DiscoverModelsArgs } from '../config/types';
import { createSyntheticModels } from '../discovery/models-dev';
import { fetchAvailableModels, discoverProviders } from '../discovery/providers';

export const handleDiscoverModels = async (context: any, args: DiscoverModelsArgs, config: any) => {
  const client = context.client;

  try {
    console.log('Discovering models...');

    if (args.provider) {
      // Discover models for specific provider only
      const providers = await discoverProviders();
      const targetProvider = providers.find((p: any) => p.name.toLowerCase().includes(args.provider!.toLowerCase()));

      if (!targetProvider) {
        return {
          success: false,
          output: `Provider "${args.provider}" not found in configuration`,
        };
      }

      console.log(`Discovering models for ${targetProvider.name}...`);

      // Clear cache for this provider
      const cache = await loadCache(context.worktree);
      const updatedCache = { ...cache };
      delete updatedCache.models;
      await saveCache(context.worktree, updatedCache);

      const models = await fetchAvailableModels(context.worktree, args.forceApi);

      console.log(
        `Found ${models.filter((m: any) => m.provider === targetProvider.name).length} models for ${targetProvider.name}`,
      );

      return {
        success: true,
        output: `Discovered ${models.filter((m: any) => m.provider === targetProvider.name).length} models for ${targetProvider.name}`,
      };
    } else {
      // Discover models for all providers
      console.log('Discovering models from all providers...');

      // Clear cache if force refresh
      if (args.forceApi) {
        const cache = await loadCache(context.worktree);
        await saveCache(context.worktree, {
          ...cache,
          models: undefined,
          modelsDev: undefined,
        });
      }

      const providers = await discoverProviders();
      const models = await fetchAvailableModels(context.worktree, args.forceApi);

      console.log('\n--- Provider Discovery Results ---');
      for (const provider of providers) {
        const providerModels = models.filter((m: any) => m.provider === provider.name);
        console.log(
          `${provider.name}: ${providerModels.length} models (${providerModels.filter((m: any) => m.available).length} available)`,
        );

        // Try to create synthetic models if no API access
        if (providerModels.length === 0 && provider.available) {
          console.log(`  No API access - trying Models.dev for ${provider.name}...`);
          const syntheticModels = await createSyntheticModels(provider.name, provider.type, context.worktree);

          if (syntheticModels.length > 0) {
            console.log(`  Created ${syntheticModels.length} synthetic models from Models.dev`);
          }
        }
      }

      console.log(
        `\nTotal: ${models.length} models found (${models.filter((m: any) => m.available).length} available)`,
      );

      return {
        success: true,
        output: `Discovered ${models.length} models from ${providers.length} providers`,
      };
    }
  } catch (error) {
    console.error('[model-selector] discover-models command failed:', error);

    return {
      success: false,
      output: `Failed to discover models: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
