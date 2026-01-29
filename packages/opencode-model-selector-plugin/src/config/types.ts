import { z } from 'zod';

// Model and provider type definitions
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  providerType: ProviderType;
  contextWindow?: number;
  maxOutput?: number;
  pricing?: {
    input?: number; // per 1M tokens
    output?: number; // per 1M tokens
  };
  capabilities: string[];
  category?: ModelCategory;
  available: boolean;
  source: 'config' | 'api' | 'models-dev';
}

export interface ProviderInfo {
  name: string;
  type: ProviderType;
  baseURL?: string;
  apiKey?: string;
  models?: Record<string, ModelConfig>;
  available: boolean;
  authLocation: 'auth.json' | 'opencode.json' | 'project';
}

export type ProviderType = 'anthropic' | 'openai' | 'google' | 'ollama' | 'azure' | 'custom';

export interface ModelConfig {
  name?: string;
  limit?: {
    context?: number;
    output?: number;
  };
  capabilities?: string[];
}

export type ModelCategory = 'large' | 'small';

// Plugin configuration schema
export const PluginConfigSchema = z.object({
  autoPrompt: z.boolean().default(true),
  models: z
    .object({
      large: z
        .object({
          provider: z.string(),
          model: z.string(),
        })
        .optional(),
      small: z
        .object({
          provider: z.string(),
          model: z.string(),
        })
        .optional(),
    })
    .optional(),
  classification: z
    .object({
      contextThreshold: z.number().default(100000),
      preferCostEffective: z.boolean().default(true),
      weightContext: z.number().default(0.3),
      weightCost: z.number().default(0.3),
      weightCapability: z.number().default(0.4),
    })
    .optional(),
  cache: z
    .object({
      ttl: z.number().default(3600000), // 1 hour in ms
      modelsDevTtl: z.number().default(86400000), // 24 hours in ms
    })
    .optional(),
});

export type PluginConfig = z.infer<typeof PluginConfigSchema>;

// Models.dev API response types
export interface ModelsDevResponse {
  models: ModelsDevModel[];
  providers: ModelsDevProvider[];
}

export interface ModelsDevModel {
  id: string;
  name: string;
  provider: string;
  type: string;
  context_window?: number;
  max_output?: number;
  input_price?: number;
  output_price?: number;
  capabilities?: string[];
  status: string;
}

export interface ModelsDevProvider {
  name: string;
  type: string;
  base_url?: string;
  auth_method?: string;
  models?: string[];
}

// UI selection types
export interface SelectionOptions {
  type: 'initial-setup' | 'manual-select' | 'change-category';
  providers?: ProviderInfo[];
  models?: ModelInfo[];
  category?: ModelCategory;
  config?: PluginConfig;
}

export interface ModelSelection {
  large: ModelInfo | null;
  small: ModelInfo | null;
  timestamp: number;
}

// Command argument types
export interface SelectModelArgs {
  provider?: string;
  category?: ModelCategory;
  auto?: boolean;
}

export interface ListModelsArgs {
  provider?: string;
  category?: ModelCategory;
  format?: 'table' | 'json';
}

export interface SetModelsArgs {
  largeProvider: string;
  largeModel: string;
  smallProvider: string;
  smallModel: string;
}

export interface DiscoverModelsArgs {
  forceApi?: boolean;
  provider?: string;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ModelCache {
  providers?: CacheEntry<ProviderInfo[]>;
  models?: CacheEntry<ModelInfo[]>;
  modelsDev?: CacheEntry<ModelsDevResponse>;
}
