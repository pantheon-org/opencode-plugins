/**
 * Type definitions for augmented agent specifications
 */

import type { AgentConfig } from '@opencode-ai/sdk';

/**
 * Interface that agent specification classes must implement
 *
 * Agent specs are defined as TypeScript classes that export:
 * - An agent name (used as the key in OpenCode config)
 * - An agent configuration (following OpenCode's AgentConfig type)
 *
 * @example
 * ```typescript
 * export class MyCustomAgent implements AgentSpec {
 *   name = 'my-custom-agent';
 *
 *   config: AgentConfig = {
 *     description: 'My custom agent for specialized tasks',
 *     model: 'anthropic/claude-3-5-sonnet-20241022',
 *     temperature: 0.7,
 *     prompt: 'You are a specialized agent...',
 *     tools: {
 *       'bash': true,
 *       'read': true,
 *     },
 *   };
 * }
 * ```
 */
export interface AgentSpec {
  /**
   * The unique name of the agent (used as key in OpenCode config)
   * Should be kebab-case, e.g., 'my-custom-agent'
   */
  name: string;

  /**
   * The agent configuration following OpenCode's AgentConfig schema
   * See SDK types.gen.d.ts - AgentConfig
   */
  config: AgentConfig;
}

/**
 * Constructor type for agent spec classes
 */
export type AgentSpecConstructor = new () => AgentSpec;

/**
 * Result of loading an agent spec file
 */
export interface AgentSpecLoadResult {
  /**
   * The file path that was loaded
   */
  filePath: string;

  /**
   * The agent spec instance (if successfully loaded)
   */
  spec?: AgentSpec;

  /**
   * Error if loading failed
   */
  error?: Error;
}

/**
 * Plugin configuration options
 */
export interface AugmentedPluginConfig {
  /**
   * Directory where agent spec files are located
   * Defaults to '.opencode/agent'
   */
  agentsDir?: string;

  /**
   * File patterns to match (glob patterns)
   * Defaults to ['**\/*.ts', '**\/*.js']
   */
  patterns?: string[];

  /**
   * Whether to log verbose information during loading
   * Defaults to false
   */
  verbose?: boolean;

  /**
   * Whether to enable default agents that ship with the plugin
   * Defaults to true
   */
  enableDefaultAgents?: boolean;

  /**
   * List of default agent names to disable (if enableDefaultAgents is true)
   * Example: ['code-reviewer', 'security-auditor']
   */
  disabledDefaultAgents?: string[];
}
