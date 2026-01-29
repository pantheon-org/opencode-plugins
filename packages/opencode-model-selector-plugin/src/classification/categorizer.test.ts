import { describe, expect, test } from 'bun:test';
import {
  scoreModelForCategory,
  classifyModel,
  getBestModelForCategory,
  getOptimalModelPair,
  filterModelsByCategory,
  getCategoryStats,
  applyProviderSpecificClassification,
  type ModelCategory,
} from './categorizer';

describe('categorizer', () => {
  const defaultWeights = {
    contextThreshold: 100000,
    preferCostEffective: true,
    weightContext: 0.3,
    weightCost: 0.3,
    weightCapability: 0.4,
  };

  test('should score GPT-4 high for large category', () => {
    const model = {
      id: 'openai/gpt-4',
      name: 'gpt-4',
      provider: 'openai',
      providerType: 'openai' as const,
      contextWindow: 128000,
      maxOutput: 4096,
      pricing: { input: 30, output: 60 },
      capabilities: ['text', 'code', 'vision'],
      available: true,
      source: 'api' as const,
    };

    const score = scoreModelForCategory(model, 'large', defaultWeights);
    expect(score).toBeGreaterThan(0.8); // Should score highly for large
  });

  test('should score GPT-3.5 high for small category', () => {
    const model = {
      id: 'openai/gpt-3.5-turbo',
      name: 'gpt-3.5-turbo',
      provider: 'openai',
      providerType: 'openai' as const,
      contextWindow: 16000,
      maxOutput: 4096,
      pricing: { input: 0.5, output: 1.5 },
      capabilities: ['text', 'code'],
      available: true,
      source: 'api' as const,
    };

    const score = scoreModelForCategory(model, 'small', defaultWeights);
    expect(score).toBeGreaterThan(0.6); // Should score reasonably for small
  });

  test('should score model with missing data gracefully', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      provider: 'test',
      providerType: 'custom' as const,
      capabilities: ['text'],
      available: true,
      source: 'config' as const,
    };

    const largeScore = scoreModelForCategory(model, 'large', defaultWeights);
    const smallScore = scoreModelForCategory(model, 'small', defaultWeights);

    expect(largeScore).toBeGreaterThanOrEqual(0);
    expect(smallScore).toBeGreaterThanOrEqual(0);
  });

  test('should classify GPT-4 as large model', () => {
    const model = {
      id: 'openai/gpt-4',
      name: 'gpt-4',
      provider: 'openai',
      providerType: 'openai' as const,
      contextWindow: 128000,
      capabilities: ['text', 'code'],
      available: true,
      source: 'api' as const,
    };

    const category = classifyModel(model, defaultWeights);
    expect(category).toBe('large');
  });

  test('should classify based on flagship patterns', () => {
    const claudeModel = {
      id: 'anthropic/claude-3-5-sonnet-20241022',
      name: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      providerType: 'anthropic' as const,
      capabilities: ['text', 'code'],
      available: true,
      source: 'api' as const,
    };

    const category = classifyModel(claudeModel, defaultWeights);
    expect(category).toBe('large'); // Should match flagship pattern
  });

  test('should classify based on context window for edge cases', () => {
    const smallModel = {
      id: 'test/small-model',
      name: 'Small Model',
      provider: 'test',
      providerType: 'custom' as const,
      contextWindow: 80000, // Below threshold
      capabilities: ['text'],
      available: true,
      source: 'config' as const,
    };

    const category = classifyModel(smallModel, defaultWeights);
    expect(category).toBe('small');
  });

  test('should get best model for large category', () => {
    const models = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 128000,
        capabilities: ['text', 'code', 'vision'],
        available: true,
        source: 'api' as const,
      },
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        contextWindow: 200000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
    ];

    const best = getBestModelForCategory(models, 'large', defaultWeights);
    expect(best).toBeDefined();
    expect(best!.name).toBe('claude-3-5-sonnet'); // Higher context window
  });

  test('should handle empty model list', () => {
    const best = getBestModelForCategory([], 'large', defaultWeights);
    expect(best).toBeNull();
  });

  test('should get optimal model pair', () => {
    const models = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 128000,
        capabilities: ['text', 'code', 'vision'],
        available: true,
        source: 'api' as const,
      },
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'gpt-3.5-turbo',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 16000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        providerType: 'anthropic' as const,
        contextWindow: 200000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
    ];

    const optimal = getOptimalModelPair(models, defaultWeights);
    expect(optimal.large).toBeDefined();
    expect(optimal.small).toBeDefined();
    expect(optimal.large!.name).toBe('claude-3-5-sonnet'); // Best large
    expect(optimal.small!.name).toBe('gpt-3.5-turbo'); // Best small
  });

  test('should filter models by category', () => {
    const models = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 128000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
        category: 'large' as ModelCategory,
      },
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'gpt-3.5-turbo',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 16000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
        category: 'small' as ModelCategory,
      },
    ];

    const largeModels = filterModelsByCategory(models, 'large', defaultWeights);
    const smallModels = filterModelsByCategory(models, 'small', defaultWeights);

    expect(largeModels).toHaveLength(1);
    expect(largeModels[0].name).toBe('gpt-4');
    expect(smallModels).toHaveLength(1);
    expect(smallModels[0].name).toBe('gpt-3.5-turbo');
  });

  test('should get category statistics', () => {
    const models = [
      {
        id: 'openai/gpt-4',
        name: 'gpt-4',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 128000,
        capabilities: ['text', 'code'],
        available: true,
        source: 'api' as const,
      },
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'gpt-3.5-turbo',
        provider: 'openai',
        providerType: 'openai' as const,
        contextWindow: 16000,
        capabilities: ['text', 'code'],
        available: false,
        source: 'api' as const,
      },
    ];

    const stats = getCategoryStats(models, defaultWeights);
    expect(stats.total).toBe(2);
    expect(stats.large).toBe(1);
    expect(stats.small).toBe(1);
    expect(stats.available).toBe(1);
    expect(stats.availableLarge).toBe(1);
    expect(stats.availableSmall).toBe(0);
  });

  test('should apply provider-specific classification', () => {
    const claudeModel = {
      id: 'anthropic/claude-3-5-sonnet',
      name: 'claude-3-5-sonnet',
      provider: 'anthropic',
      providerType: 'anthropic' as const,
      contextWindow: 200000,
      capabilities: ['text', 'code'],
      available: true,
      source: 'api' as const,
    };

    const category = applyProviderSpecificClassification(claudeModel);
    expect(category).toBe('large'); // Anthropic flagship pattern
  });

  test('should handle unknown provider types', () => {
    const customModel = {
      id: 'custom/provider-model',
      name: 'Custom Provider Model',
      provider: 'custom-provider',
      providerType: 'custom' as const,
      contextWindow: 100000,
      capabilities: ['text', 'code'],
      available: true,
      source: 'api' as const,
    };

    const category = applyProviderSpecificClassification(customModel);
    expect(category).toBeNull(); // No specific rules for custom
  });

  test('should respect cost-effective preference', () => {
    const expensiveModel = {
      id: 'premium/expensive-model',
      name: 'Expensive Model',
      provider: 'premium',
      providerType: 'custom' as const,
      contextWindow: 200000,
      pricing: { input: 50, output: 100 },
      capabilities: ['text', 'code', 'vision'],
      available: true,
      source: 'api' as const,
    };

    const cheapModel = {
      id: 'budget/cheap-model',
      name: 'Cheap Model',
      provider: 'budget',
      providerType: 'custom' as const,
      contextWindow: 100000,
      pricing: { input: 0.5, output: 1 },
      capabilities: ['text', 'code'],
      available: true,
      source: 'api' as const,
    };

    const costEffectiveWeights = { ...defaultWeights, preferCostEffective: true };
    const premiumWeights = { ...defaultWeights, preferCostEffective: false };

    const cheapSmallScore = scoreModelForCategory(cheapModel, 'small', costEffectiveWeights);
    const expensiveSmallScore = scoreModelForCategory(expensiveModel, 'small', costEffectiveWeights);

    const cheapLargeScore = scoreModelForCategory(cheapModel, 'large', premiumWeights);
    const expensiveLargeScore = scoreModelForCategory(expensiveModel, 'large', premiumWeights);

    expect(cheapSmallScore).toBeGreaterThan(expensiveSmallScore); // Cost-effective prefers cheap
    expect(expensiveLargeScore).toBeGreaterThan(cheapLargeScore); // Premium prefers expensive
  });
});
