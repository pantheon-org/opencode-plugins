import { loadCache, saveCache, setCacheEntry } from '../config/loader';
import type { ModelInfo, ModelsDevResponse, ModelsDevModel } from '../config/types';

const MODELS_DEV_API = 'https://models.dev/api/models';

// Fetch comprehensive model data from Models.dev
export const fetchModelsDevData = async (worktree: string): Promise<ModelsDevResponse> => {
  const cache = await loadCache(worktree);
  const now = Date.now();

  // Check cache first (24-hour TTL for Models.dev data)
  if (cache.modelsDev && now - cache.modelsDev.timestamp < cache.modelsDev.ttl) {
    return cache.modelsDev.data as ModelsDevResponse;
  }

  try {
    const response = await fetch(MODELS_DEV_API, {
      headers: {
        'User-Agent': '@pantheon-org/opencode-model-selector-plugin',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Models.dev API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the results for 24 hours
    const updatedCache = setCacheEntry(cache, 'modelsDev', data, 86400000); // 24 hours
    await saveCache(worktree, updatedCache);

    return data;
  } catch (error) {
    console.warn('[model-selector] Failed to fetch Models.dev data:', error);

    // Return empty structure if API fails
    return {
      models: [],
      providers: [],
    };
  }
};

// Find matching model in Models.dev data
export const findModelsDevModel = (model: ModelInfo, modelsDevData: ModelsDevResponse): ModelsDevModel | null => {
  const baseModelName = model.name.split('/').pop() || model.name;

  // Try exact match first
  let devModel = modelsDevData.models.find(
    (m: any) => m.id === baseModelName || m.name === baseModelName || m.id === model.name || m.name === model.name,
  );

  // Try provider-specific match
  if (!devModel) {
    devModel = modelsDevData.models.find(
      (m: any) =>
        (m.provider === model.provider || m.provider === model.providerType) &&
        (m.name.toLowerCase().includes(baseModelName.toLowerCase()) ||
          baseModelName.toLowerCase().includes(m.name.toLowerCase())),
    );
  }

  // Try partial match
  if (!devModel) {
    devModel = modelsDevData.models.find((m: any) => {
      const modelTokens = baseModelName.toLowerCase().split(/[-\s]/);
      const devTokens = m.name.toLowerCase().split(/[-\s]/);

      // Check if most tokens match
      const matchingTokens = modelTokens.filter((token: string) =>
        devTokens.some((devToken: string) => devToken.includes(token) || token.includes(devToken)),
      );

      return matchingTokens.length >= Math.min(modelTokens.length, devTokens.length) * 0.7;
    });
  }

  return devModel || null;
};

// Enrich model information with Models.dev data
export const enrichModelFromDev = (model: ModelInfo, modelsDevData: ModelsDevResponse): ModelInfo => {
  const devModel = findModelsDevModel(model, modelsDevData);

  if (!devModel) {
    return model;
  }

  // Enrich with Models.dev data if our data is incomplete
  const enriched = { ...model };

  if (!model.contextWindow && devModel.context_window) {
    enriched.contextWindow = devModel.context_window;
  }

  if (!model.maxOutput && devModel.max_output) {
    enriched.maxOutput = devModel.max_output;
  }

  if (!model.pricing && (devModel.input_price || devModel.output_price)) {
    enriched.pricing = {
      input: devModel.input_price || 0,
      output: devModel.output_price || 0,
    };
  }

  if (devModel.capabilities && devModel.capabilities.length > model.capabilities.length) {
    enriched.capabilities = devModel.capabilities;
  }

  // Add Models.dev as a source annotation
  if (model.source !== 'models-dev') {
    enriched.source = model.source as any; // Keep original primary source
  }

  return enriched;
};

// Get provider information from Models.dev
export const getModelsDevProvider = (providerName: string, modelsDevData: ModelsDevResponse) => {
  return modelsDevData.providers.find(
    (p: any) =>
      p.name.toLowerCase() === providerName.toLowerCase() ||
      p.name.toLowerCase().replace(/\s+/g, '-') === providerName.toLowerCase(),
  );
};

// Get all models for a specific provider from Models.dev
export const getModelsDevProviderModels = (
  providerName: string,
  providerType: string,
  modelsDevData: ModelsDevResponse,
): ModelsDevModel[] => {
  return modelsDevData.models.filter((m: any) => {
    const providerMatch =
      m.provider.toLowerCase() === providerName.toLowerCase() ||
      m.provider.toLowerCase() === providerType.toLowerCase();

    return providerMatch && m.status === 'available';
  });
};

// Convert Models.dev model to our ModelInfo format
export const convertModelsDevModel = (
  devModel: ModelsDevModel,
  ourProviderName: string,
  ourProviderType: string,
): ModelInfo => {
  const pricing =
    devModel.input_price !== undefined || devModel.output_price !== undefined
      ? {
          input: devModel.input_price ?? 0,
          output: devModel.output_price ?? 0,
        }
      : undefined;

  return {
    id: `${ourProviderName}/${devModel.id}`,
    name: devModel.name,
    provider: ourProviderName,
    providerType: ourProviderType as any,
    contextWindow: devModel.context_window || 0,
    maxOutput: devModel.max_output || 0,
    pricing: pricing as any,
    capabilities: devModel.capabilities || [],
    available: devModel.status === 'available',
    source: 'models-dev',
  };
};

// Create synthetic models from Models.dev for providers that don't have API access
export const createSyntheticModels = async (
  providerName: string,
  providerType: string,
  worktree: string,
): Promise<ModelInfo[]> => {
  try {
    const modelsDevData = await fetchModelsDevData(worktree);
    const devModels = getModelsDevProviderModels(providerName, providerType, modelsDevData);

    return devModels.map((devModel: any) => convertModelsDevModel(devModel, providerName, providerType));
  } catch (error) {
    console.warn(`[model-selector] Failed to create synthetic models for ${providerName}:`, error);
    return [];
  }
};
