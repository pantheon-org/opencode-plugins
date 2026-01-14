/**
 * opencode-agent-loader-plugin - Dynamic Agent Spec Loader
 *
 * This OpenCode plugin allows you to dynamically load custom agent specifications
 * from TypeScript files. Agents are defined as classes implementing the AgentSpec
 * interface and are automatically registered with OpenCode.
 *
 * @example
 * Place agent spec files in `.opencode/agent/` directory:
 *
 * ```typescript
 * // .opencode/agent/my-agent.ts
 * import type { AgentSpec } from '@pantheon-org/opencode-agent-loader-plugin';
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

import { loadAllAgentSpecs, loadDefaultAgents, loadPluginConfig } from './loader';

// Re-export types for consumer convenience
export type { AgentSpec, AgentSpecConstructor, AgentSpecLoadResult, AugmentedPluginConfig } from './types';

// Re-export config utilities for users
export { createDefaultPluginConfig } from './loader';

/**
 * OpenCode Augmented Plugin
 *
 * Dynamically loads and registers custom agent specifications from TypeScript files.
 * Agent specs are discovered in `.opencode/agent/` directory (configurable).
 *
 * Configuration (in .opencode/plugin.json):
 * ```json
 * {
 *   "@pantheon-org/opencode-agent-loader-plugin": {
 *     "agentsDir": ".opencode/agent",
 *     "verbose": true,
 *     "enableDefaultAgents": true,
 *     "disabledDefaultAgents": ["code-reviewer"]
 *   }
 * }
 * ```
 */
export const OpencodeAugmentedPlugin: Plugin = async (ctx) => {
  const { worktree } = ctx;

  console.log('[opencode-agent-loader-plugin] Initializing plugin');
  console.log('[opencode-agent-loader-plugin] Worktree:', worktree);

  // Load plugin configuration from .opencode/plugin.json
  const pluginConfig = await loadPluginConfig(worktree);

  if (pluginConfig.verbose) {
    console.log('[opencode-agent-loader-plugin] Configuration:', pluginConfig);
  }

  // Load default agents that ship with the plugin
  const defaultAgents = loadDefaultAgents(pluginConfig);

  // Load user-defined agent specs from project
  const userAgentSpecs = await loadAllAgentSpecs(worktree, pluginConfig);

  // Combine default and user agents
  const allAgentSpecs = [...defaultAgents, ...userAgentSpecs];

  if (defaultAgents.length > 0) {
    console.log(
      `[opencode-agent-loader-plugin] Loaded ${defaultAgents.length} default agent(s): ${defaultAgents.map((s) => s.name).join(', ')}`,
    );
  }

  if (userAgentSpecs.length === 0) {
    console.log('[opencode-agent-loader-plugin] No user-defined agent specs found');
    console.log(`[opencode-agent-loader-plugin] Create agent specs in: ${worktree}/${pluginConfig.agentsDir}`);
  } else {
    console.log(
      `[opencode-agent-loader-plugin] Loaded ${userAgentSpecs.length} user-defined agent spec(s): ${userAgentSpecs.map((s) => s.name).join(', ')}`,
    );
  }

  console.log(`[opencode-agent-loader-plugin] Total agents available: ${allAgentSpecs.length}`);

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
        console.log('[opencode-agent-loader-plugin] Registering agents with OpenCode config');
      }

      // Initialize agent config if not present
      if (!config.agent) {
        config.agent = {};
      }

      // Register each loaded agent (default + user-defined)
      for (const spec of allAgentSpecs) {
        if (config.agent[spec.name]) {
          console.warn(`[opencode-agent-loader-plugin] Agent "${spec.name}" already exists, skipping registration`);
          continue;
        }

        // Register the agent configuration
        config.agent[spec.name] = spec.config;

        if (pluginConfig.verbose) {
          console.log(`[opencode-agent-loader-plugin] Registered agent: ${spec.name}`);
        }
      }

      if (pluginConfig.verbose) {
        console.log('[opencode-agent-loader-plugin] Agent registration complete');
      }
    },

    /**
     * Event handler - Log agent-related events
     */
    event: async ({ event }) => {
      if (pluginConfig.verbose) {
        // Log session events that might be relevant to agent usage
        if (event.type === 'session.created' || event.type === 'session.updated') {
          console.log(`[opencode-agent-loader-plugin] Event: ${event.type}`);
        }
      }
    },
  };
};
