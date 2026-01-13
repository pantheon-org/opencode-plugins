/**
 * opencode-augmented-plugin - Dynamic Agent Spec Loader
 *
 * This OpenCode plugin allows you to dynamically load custom agent specifications
 * from TypeScript files. Agents are defined as classes implementing the AgentSpec
 * interface and are automatically registered with OpenCode.
 *
 * @example
 * Place agent spec files in `.opencode/agents/` directory:
 *
 * ```typescript
 * // .opencode/agents/my-agent.ts
 * import type { AgentSpec } from '@pantheon-org/opencode-augmented-plugin';
 * import type { AgentConfig } from '@opencode-ai/sdk';
 *
 * export class MyCustomAgent implements AgentSpec {
 *   name = 'my-custom-agent';
 *
 *   config: AgentConfig = {
 *     description: 'A specialized agent for custom tasks',
 *     model: 'anthropic/claude-3-5-sonnet-20241022',
 *     temperature: 0.7,
 *     prompt: 'You are a specialized agent...',
 *     tools: {
 *       bash: true,
 *       read: true,
 *     },
 *   };
 * }
 * ```
 */

import type { Plugin } from '@opencode-ai/plugin';

import { loadAllAgentSpecs } from './loader';
import type { AugmentedPluginConfig } from './types';

// Re-export types for consumer convenience
export type { AgentSpec, AgentSpecConstructor, AgentSpecLoadResult, AugmentedPluginConfig } from './types';

/**
 * OpenCode Augmented Plugin
 *
 * Dynamically loads and registers custom agent specifications from TypeScript files.
 * Agent specs are discovered in `.opencode/agents/` directory (configurable).
 *
 * Configuration (in opencode.json):
 * ```json
 * {
 *   "plugin": ["@pantheon-org/opencode-augmented-plugin"],
 *   "augmented": {
 *     "agentsDir": ".opencode/agents",
 *     "verbose": true
 *   }
 * }
 * ```
 */
export const OpencodeAugmentedPlugin: Plugin = async (ctx) => {
  const { worktree } = ctx;

  // Get plugin configuration from opencode.json (if available)
  // This would need to be accessed via the config hook or passed in
  const pluginConfig: AugmentedPluginConfig = {
    agentsDir: '.opencode/agents',
    verbose: process.env.OPENCODE_VERBOSE === 'true' || false,
  };

  console.log('[opencode-augmented-plugin] Initializing plugin');
  console.log('[opencode-augmented-plugin] Worktree:', worktree);

  // Load all agent specs
  const agentSpecs = await loadAllAgentSpecs(worktree, pluginConfig);

  if (agentSpecs.length === 0) {
    console.log('[opencode-augmented-plugin] No agent specs found');
    console.log(`[opencode-augmented-plugin] Create agent specs in: ${worktree}/${pluginConfig.agentsDir}`);
  } else {
    console.log(
      `[opencode-augmented-plugin] Loaded ${agentSpecs.length} agent spec(s): ${agentSpecs.map((s) => s.name).join(', ')}`,
    );
  }

  // Return plugin hooks
  return {
    /**
     * Config hook - Register discovered agents with OpenCode configuration
     *
     * This hook modifies the OpenCode configuration to add the discovered agents.
     * The agents are added to the config.agent object with their specs.
     */
    config: async (config) => {
      if (pluginConfig.verbose) {
        console.log('[opencode-augmented-plugin] Registering agents with OpenCode config');
      }

      // Initialize agent config if not present
      if (!config.agent) {
        config.agent = {};
      }

      // Register each loaded agent
      for (const spec of agentSpecs) {
        if (config.agent[spec.name]) {
          console.warn(`[opencode-augmented-plugin] Agent "${spec.name}" already exists, skipping registration`);
          continue;
        }

        // Register the agent configuration
        config.agent[spec.name] = spec.config;

        if (pluginConfig.verbose) {
          console.log(`[opencode-augmented-plugin] Registered agent: ${spec.name}`);
        }
      }

      if (pluginConfig.verbose) {
        console.log('[opencode-augmented-plugin] Agent registration complete');
      }
    },

    /**
     * Event handler - Log agent-related events
     */
    event: async ({ event }) => {
      if (pluginConfig.verbose) {
        // Log session events that might be relevant to agent usage
        if (event.type === 'session.created' || event.type === 'session.updated') {
          console.log(`[opencode-augmented-plugin] Event: ${event.type}`);
        }
      }
    },
  };
};
