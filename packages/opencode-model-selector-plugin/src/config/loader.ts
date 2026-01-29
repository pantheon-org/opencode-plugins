import { homedir } from 'node:os';
import { join } from 'node:path';

import { PluginConfig, PluginConfigSchema, type ModelCache, type ModelSelection } from './types';

// Configuration file paths
const getPluginConfigPath = (worktree: string): string => {
  return join(worktree, '.opencode', 'plugin.json');
};

const getOpenCodeConfigPath = (): string => {
  return join(homedir(), '.config', 'opencode', 'opencode.json');
};

const getAuthConfigPath = (): string => {
  return join(homedir(), '.local', 'share', 'opencode', 'auth.json');
};

const getProjectConfigPath = (worktree: string): string => {
  return join(worktree, 'opencode.json');
};

// Load plugin configuration
export const loadPluginConfig = async (worktree: string): Promise<PluginConfig> => {
  try {
    const configPath = getPluginConfigPath(worktree);
    const file = Bun.file(configPath);

    if (await file.exists()) {
      const configData = await file.json();
      const pluginConfig = configData['@pantheon-org/opencode-model-selector-plugin'];

      if (pluginConfig) {
        return PluginConfigSchema.parse(pluginConfig);
      }
    }
  } catch (error) {
    console.warn('[model-selector] Failed to load plugin config:', error);
  }

  // Return default configuration
  return PluginConfigSchema.parse({});
};

// Save plugin configuration
export const savePluginConfig = async (worktree: string, config: Partial<PluginConfig>): Promise<void> => {
  try {
    const configPath = getPluginConfigPath(worktree);
    const file = Bun.file(configPath);

    let configData: Record<string, any> = {};

    if (await file.exists()) {
      configData = await file.json();
    }

    // Merge with existing config
    const existingConfig = configData['@pantheon-org/opencode-model-selector-plugin'] || {};
    const newConfig = { ...existingConfig, ...config };

    configData['@pantheon-org/opencode-model-selector-plugin'] = newConfig;

    // Ensure directory exists
    await Bun.write(configPath, JSON.stringify(configData, null, 2));
  } catch (error) {
    console.error('[model-selector] Failed to save plugin config:', error);
    throw error;
  }
};

// Load OpenCode configuration
export const loadOpenCodeConfig = async (): Promise<any> => {
  const configPaths = [getOpenCodeConfigPath(), getProjectConfigPath(process.cwd())];

  for (const configPath of configPaths) {
    try {
      const file = Bun.file(configPath);
      if (await file.exists()) {
        return await file.json();
      }
    } catch (error) {
      console.warn(`[model-selector] Failed to load config from ${configPath}:`, error);
    }
  }

  return {};
};

// Load auth configuration
export const loadAuthConfig = async (): Promise<any> => {
  try {
    const authPath = getAuthConfigPath();
    const file = Bun.file(authPath);

    if (await file.exists()) {
      return await file.json();
    }
  } catch (error) {
    console.warn('[model-selector] Failed to load auth config:', error);
  }

  return {};
};

// Cache management
const getCachePath = (worktree: string): string => {
  return join(worktree, '.opencode', 'model-selector-cache.json');
};

export const loadCache = async (worktree: string): Promise<ModelCache> => {
  try {
    const cachePath = getCachePath(worktree);
    const file = Bun.file(cachePath);

    if (await file.exists()) {
      const cacheData = await file.json();

      // Validate cache entries are not expired
      const now = Date.now();
      const validCache: ModelCache = {};

      for (const [key, entry] of Object.entries(cacheData) as [keyof ModelCache, any][]) {
        if (entry && typeof entry === 'object' && entry.timestamp && entry.ttl) {
          if (now - entry.timestamp < entry.ttl) {
            validCache[key] = entry;
          }
        }
      }

      return validCache;
    }
  } catch (error) {
    console.warn('[model-selector] Failed to load cache:', error);
  }

  return {};
};

export const saveCache = async (worktree: string, cache: ModelCache): Promise<void> => {
  try {
    const cachePath = getCachePath(worktree);
    await Bun.write(cachePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.warn('[model-selector] Failed to save cache:', error);
  }
};

export const setCacheEntry = <T>(cache: ModelCache, key: keyof ModelCache, data: T, ttl: number): ModelCache => {
  (cache as any)[key] = {
    data,
    timestamp: Date.now(),
    ttl,
  };

  return { ...cache };
};

// Model selection management
export const loadModelSelection = async (worktree: string): Promise<ModelSelection | null> => {
  try {
    const config = await loadPluginConfig(worktree);

    if (config.models?.large && config.models?.small) {
      // This is a simplified version - in reality we'd need to resolve the model info
      return {
        large: {
          id: `${config.models.large.provider}/${config.models.large.model}`,
          name: config.models.large.model,
          provider: config.models.large.provider,
          providerType: 'custom', // Would need to resolve actual type
          capabilities: [],
          available: true,
          source: 'config',
        },
        small: {
          id: `${config.models.small.provider}/${config.models.small.model}`,
          name: config.models.small.model,
          provider: config.models.small.provider,
          providerType: 'custom',
          capabilities: [],
          available: true,
          source: 'config',
        },
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.warn('[model-selector] Failed to load model selection:', error);
  }

  return null;
};

export const saveModelSelection = async (worktree: string, selection: ModelSelection): Promise<void> => {
  const config: any = {
    models: {
      large: selection.large
        ? {
            provider: selection.large.provider,
            model: selection.large.name,
          }
        : undefined,
      small: selection.small
        ? {
            provider: selection.small.provider,
            model: selection.small.name,
          }
        : undefined,
    },
  };

  await savePluginConfig(worktree, config);
};
