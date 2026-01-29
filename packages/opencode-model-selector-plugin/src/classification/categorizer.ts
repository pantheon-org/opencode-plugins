import type { ModelInfo, PluginConfig } from '../config/types.js';

export type ModelCategory = 'large' | 'small';

// Model classification criteria
const LARGE_MODEL_THRESHOLDS = {
  contextWindow: 100000, // 100k tokens
  flagshipPatterns: ['gpt-4', 'claude-3-5-sonnet', 'claude-3-opus', 'llama-3.1-405b', 'gemini-pro', 'gemini-1.5-pro'],
  costThreshold: 10, // $10+ per 1M input tokens
};

const SMALL_MODEL_THRESHOLDS = {
  contextWindow: 32000, // 32k tokens
  fastPatterns: [
    'gpt-3.5',
    'claude-3-5-haiku',
    'claude-3-haiku',
    'llama-3.1-70b',
    'llama-3.1-8b',
    'gemini-flash',
    'gemini-1.5-flash',
  ],
  costThreshold: 1, // <$1 per 1M input tokens
};

// Score a model for a specific category
export const scoreModelForCategory = (
  model: ModelInfo,
  category: ModelCategory,
  weights?: PluginConfig['classification'],
): number => {
  const w = weights || {
    contextThreshold: 100000,
    preferCostEffective: true,
    weightContext: 0.3,
    weightCost: 0.3,
    weightCapability: 0.4,
  };

  let score = 0;

  // Context window scoring
  if (model.contextWindow) {
    if (category === 'large') {
      score += Math.min(model.contextWindow / LARGE_MODEL_THRESHOLDS.contextWindow, 2) * w.weightContext;
    } else {
      // For small models, prefer moderate context windows (not too small, not wasteful)
      const optimalContext = 50000;
      const diff = Math.abs(model.contextWindow - optimalContext);
      score += Math.max(0, 1 - diff / optimalContext) * w.weightContext;
    }
  }

  // Cost scoring
  if (model.pricing?.input) {
    if (w.preferCostEffective) {
      // Prefer cheaper models
      if (category === 'large') {
        score += Math.max(0, 1 - model.pricing.input / 50) * w.weightCost; // Normalize to $50
      } else {
        score += Math.max(0, 1 - model.pricing.input / 10) * w.weightCost; // Normalize to $10
      }
    } else {
      // Prefer premium models for large, budget for small
      if (category === 'large') {
        score += Math.min(model.pricing.input / LARGE_MODEL_THRESHOLDS.costThreshold, 2) * w.weightCost;
      } else {
        score += Math.max(0, 1 - model.pricing.input / SMALL_MODEL_THRESHOLDS.costThreshold) * w.weightCost;
      }
    }
  }

  // Capability scoring
  const hasCode = model.capabilities.includes('code');
  const hasVision = model.capabilities.includes('vision');
  const hasToolUse = model.capabilities.includes('tools') || model.capabilities.includes('function-calling');

  if (category === 'large') {
    score += (hasCode ? 0.3 : 0) * w.weightCapability;
    score += (hasVision ? 0.2 : 0) * w.weightCapability;
    score += (hasToolUse ? 0.5 : 0) * w.weightCapability;
  } else {
    score += (hasCode ? 0.4 : 0) * w.weightCapability;
    score += (hasVision ? 0.1 : 0) * w.weightCapability;
    score += (hasToolUse ? 0.5 : 0) * w.weightCapability;
  }

  return score;
};

// Classify a model into large or small category
export const classifyModel = (model: ModelInfo, weights?: PluginConfig['classification']): ModelCategory => {
  const largeScore = scoreModelForCategory(model, 'large', weights);
  const smallScore = scoreModelForCategory(model, 'small', weights);

  // Flagship model patterns get special treatment
  const isFlagshipLarge = LARGE_MODEL_THRESHOLDS.flagshipPatterns.some((pattern) =>
    model.name.toLowerCase().includes(pattern.toLowerCase()),
  );
  const isFlagshipSmall = SMALL_MODEL_THRESHOLDS.fastPatterns.some((pattern) =>
    model.name.toLowerCase().includes(pattern.toLowerCase()),
  );

  if (isFlagshipLarge) {
    return 'large';
  }

  if (isFlagshipSmall) {
    return 'small';
  }

  // Use scoring to determine category
  return largeScore > smallScore ? 'large' : 'small';
};

// Get best model for a category from a list of models
export const getBestModelForCategory = (
  models: ModelInfo[],
  category: ModelCategory,
  weights?: PluginConfig['classification'],
): ModelInfo | null => {
  const availableModels = models.filter((model) => model.available);
  const categorizedModels = availableModels.filter((model) => classifyModel(model, weights) === category);

  if (categorizedModels.length === 0) {
    return null;
  }

  // Score and sort models
  const scoredModels = categorizedModels.map((model) => ({
    model,
    score: scoreModelForCategory(model, category, weights),
  }));

  scoredModels.sort((a, b) => b.score - a.score);

  return scoredModels[0]?.model || null;
};

// Get optimal large and small model pair
export const getOptimalModelPair = (
  models: ModelInfo[],
  weights?: PluginConfig['classification'],
): { large: ModelInfo | null; small: ModelInfo | null } => {
  const large = getBestModelForCategory(models, 'large', weights);
  const small = getBestModelForCategory(models, 'small', weights);

  return { large, small };
};

// Filter models by category
export const filterModelsByCategory = (
  models: ModelInfo[],
  category: ModelCategory,
  weights?: PluginConfig['classification'],
): ModelInfo[] => {
  return models.filter((model) => classifyModel(model, weights) === category);
};

// Get category distribution statistics
export const getCategoryStats = (
  models: ModelInfo[],
  weights?: PluginConfig['classification'],
): {
  total: number;
  large: number;
  small: number;
  available: number;
  availableLarge: number;
  availableSmall: number;
} => {
  const stats = {
    total: models.length,
    large: 0,
    small: 0,
    available: models.filter((m) => m.available).length,
    availableLarge: 0,
    availableSmall: 0,
  };

  for (const model of models) {
    const category = classifyModel(model, weights);
    stats[category]++;

    if (model.available) {
      stats[
        `available${category.charAt(0).toUpperCase() + category.slice(1)}` as 'availableLarge' | 'availableSmall'
      ]++;
    }
  }

  return stats;
};

// Provider-specific classification rules
const PROVIDER_CLASSIFICATION_RULES = {
  anthropic: {
    large: ['claude-3-5-sonnet', 'claude-3-opus'],
    small: ['claude-3-5-haiku', 'claude-3-haiku'],
  },
  openai: {
    large: ['gpt-4'],
    small: ['gpt-3.5'],
  },
  google: {
    large: ['gemini-pro', 'gemini-1.5-pro'],
    small: ['gemini-flash', 'gemini-1.5-flash'],
  },
};

// Apply provider-specific classification
export const applyProviderSpecificClassification = (model: ModelInfo): ModelCategory | null => {
  const rules = PROVIDER_CLASSIFICATION_RULES[model.providerType as keyof typeof PROVIDER_CLASSIFICATION_RULES];

  if (!rules) {
    return null;
  }

  for (const largePattern of rules.large) {
    if (model.name.toLowerCase().includes(largePattern.toLowerCase())) {
      return 'large';
    }
  }

  for (const smallPattern of rules.small) {
    if (model.name.toLowerCase().includes(smallPattern.toLowerCase())) {
      return 'small';
    }
  }

  return null;
};
