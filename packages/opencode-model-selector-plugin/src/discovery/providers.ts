import { loadAuthConfig, loadOpenCodeConfig, loadCache, saveCache, setCacheEntry } from '../config/loader';
import type { ProviderInfo, ModelInfo, ProviderType } from '../config/types';

import { fetchModelsDevData, enrichModelFromDev } from './models-dev';

// Map provider types to API endpoints for model discovery
const PROVIDER_API_ENDPOINTS: Record<ProviderType, string | null> = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/models',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  ollama: 'http://localhost:11434/api/tags',
  azure: null, // Azure requires custom endpoints
  custom: null, // Custom providers have no standard endpoint
};

// Discover configured providers from OpenCode config and auth
export const discoverProviders = async (): Promise<ProviderInfo[]> => {
  const providers: ProviderInfo[] = [];

  // Load configurations
  const authConfig = await loadAuthConfig();
  const openCodeConfig = await loadOpenCodeConfig();

  // Process auth.json first (highest priority)
  if (authConfig.providers) {
    for (const [name, config] of Object.entries(authConfig.providers)) {
      const providerConfig = config as any;

      providers.push({
        name,
        type: providerConfig.type || 'custom',
        baseURL: providerConfig.baseURL || PROVIDER_API_ENDPOINTS[(providerConfig.type as ProviderType) || 'custom'],
        apiKey: providerConfig.apiKey,
        available: !!providerConfig.apiKey,
        authLocation: 'auth.json',
      });
    }
  }

  // Process opencode.json
  if (openCodeConfig.provider) {
    for (const [name, config] of Object.entries(openCodeConfig.provider)) {
      // Skip if already added from auth.json
      if (providers.some((p: any) => p.name === name)) {
        continue;
      }

      const providerConfig = config as any;

      providers.push({
        name,
        type: name as ProviderType,
        baseURL: providerConfig.options?.baseURL,
        apiKey: providerConfig.options?.apiKey,
        models: providerConfig.models || {},
        available: true, // Assume available if in config
        authLocation: 'opencode.json',
      });
    }
  }

  return providers;
};

// Fetch models from a specific provider API
export const fetchProviderModels = async (provider: ProviderInfo): Promise<ModelInfo[]> => {
  const models: ModelInfo[] = [];

  try {
    switch (provider.type) {
      case 'openai':
        if (provider.apiKey && provider.baseURL) {
          const response = await fetch(`${provider.baseURL}`, {
            headers: {
              Authorization: `Bearer ${provider.apiKey}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            for (const model of data.data || []) {
              models.push({
                id: `${provider.name}/${model.id}`,
                name: model.id,
                provider: provider.name,
                providerType: provider.type,
                contextWindow: model.context_window || 0,
                maxOutput: model.max_tokens || 0,
                capabilities: model.capabilities || [],
                available: true,
                source: 'api',
              });
            }
          }
        }
        break;

      case 'anthropic':
        // Anthropic doesn't have a public models endpoint
        // Use known model list
        const anthropicModels = [
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022',
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
        ];

        for (const modelId of anthropicModels) {
          models.push({
            id: `${provider.name}/${modelId}`,
            name: modelId,
            provider: provider.name,
            providerType: provider.type,
            capabilities: ['text', 'code'],
            available: !!provider.apiKey,
            source: 'api',
          });
        }
        break;

      case 'google':
        if (provider.apiKey) {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${provider.apiKey}`,
          );

          if (response.ok) {
            const data = await response.json();
            for (const model of data.models || []) {
              if ((model.supportedGenerationMethods as string[])?.includes('generateContent')) {
                models.push({
                  id: `${provider.name}/${model.name}`,
                  name: (model as any).displayName || model.name,
                  provider: provider.name,
                  providerType: provider.type,
                  contextWindow: (model as any).inputTokenLimit || 0,
                  capabilities: ['text', 'code'],
                  available: true,
                  source: 'api',
                });
              }
            }
          }
        }
        break;

      case 'ollama':
        try {
          const response = await fetch(`${provider.baseURL || 'http://localhost:11434'}/api/tags`);

          if (response.ok) {
            const data = await response.json();
            for (const model of data.models || []) {
              models.push({
                id: `${provider.name}/${(model as any).name}`,
                name: (model as any).name,
                provider: provider.name,
                providerType: provider.type,
                capabilities: ['text', 'code'],
                available: true,
                source: 'api',
              });
            }
          }
        } catch (error) {
          console.warn(`[model-selector] Failed to fetch Ollama models:`, error);
        }
        break;

      case 'azure':
        // Azure OpenAI - similar to OpenAI but with different endpoint structure
        // This would need custom handling based on Azure deployment configuration
        break;

      case 'custom':
        // For custom providers, try to get models from config
        if (provider.models) {
          for (const [modelId, modelConfig] of Object.entries(provider.models)) {
            models.push({
              id: `${provider.name}/${modelId}`,
              name: (modelConfig as any).name || modelId,
              provider: provider.name,
              providerType: provider.type,
              contextWindow: (modelConfig as any).limit?.context || 0,
              maxOutput: (modelConfig as any).limit?.output || 0,
              capabilities: (modelConfig as any).capabilities || [],
              available: true,
              source: 'config',
            });
          }
        }
        break;
    }
  } catch (error) {
    console.warn(`[model-selector] Failed to fetch models from ${provider.name}:`, error);
  }

  return models;
};

// Fetch all available models from all sources
export const fetchAvailableModels = async (worktree: string, forceRefresh = false): Promise<ModelInfo[]> => {
  const cache = await loadCache(worktree);
  const now = Date.now();

  // Check cache first
  if (!forceRefresh && cache.models && now - cache.models.timestamp < cache.models.ttl) {
    return cache.models.data as ModelInfo[];
  }

  const allModels: ModelInfo[] = [];

  try {
    // Discover providers
    const providers = await discoverProviders();

    // Fetch models from each provider
    for (const provider of providers) {
      try {
        const models = await fetchProviderModels(provider);
        allModels.push(...models);
      } catch (error) {
        console.warn(`[model-selector] Failed to fetch models from ${provider.name}:`, error);
      }
    }

    // Enrich with Models.dev data
    try {
      const modelsDevData = await fetchModelsDevData(worktree);
      for (const model of allModels) {
        enrichModelFromDev(model, modelsDevData);
      }
    } catch (error) {
      console.warn('[model-selector] Failed to enrich with Models.dev data:', error);
    }

    // Remove duplicates (keep most detailed version)
    const uniqueModels = new Map<string, ModelInfo>();
    for (const model of allModels) {
      const existing = uniqueModels.get(model.id);
      if (
        !existing ||
        (model.source === 'api' && existing.source !== 'api') ||
        (model.contextWindow && !existing.contextWindow)
      ) {
        uniqueModels.set(model.id, model);
      }
    }

    const finalModels = Array.from(uniqueModels.values());

    // Cache the results
    const updatedCache = setCacheEntry(cache, 'models', finalModels, 3600000); // 1 hour
    await saveCache(worktree, updatedCache);

    return finalModels;
  } catch (error) {
    console.error('[model-selector] Failed to fetch available models:', error);
    return [];
  }
};

// Get models by provider
export const getModelsByProvider = async (worktree: string, providerName: string): Promise<ModelInfo[]> => {
  const allModels = await fetchAvailableModels(worktree);
  return allModels.filter((model: any) => model.provider === providerName);
};

// Search models by name or capability
export const searchModels = async (worktree: string, query: string): Promise<ModelInfo[]> => {
  const allModels = await fetchAvailableModels(worktree);
  const lowerQuery = query.toLowerCase();

  return allModels.filter(
    (model: any) =>
      model.name.toLowerCase().includes(lowerQuery) ||
      model.provider.toLowerCase().includes(lowerQuery) ||
      model.capabilities.some((cap: string) => cap.toLowerCase().includes(lowerQuery)),
  );
};
