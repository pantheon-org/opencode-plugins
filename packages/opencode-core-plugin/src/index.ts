/**
 * opencode-core-plugin - Core OpenCode Agents and Skills
 *
 * This plugin provides core agent specifications and skills for OpenCode,
 * including the OpenCode specialist agent for configuration and usage guidance.
 */

import type { Plugin } from '@opencode-ai/plugin';
import { createSkillsPlugin } from '@pantheon-org/opencode-skills';

import { OpencodeSpecialistAgent } from './agents';
import { opencodeAgentDevelopmentSkill, opencodeCustomToolsSkill, opencodePluginDevelopmentSkill } from './skills';

// Re-export types for consumer convenience
export type { AgentSpec } from './types';

/**
 * OpenCode Core Plugin
 *
 * Provides core agent specifications including:
 * - opencode: OpenCode configuration and usage specialist
 */
export const OpencodeCorePlugin: Plugin = async (ctx) => {
  const { worktree, client } = ctx;

  // Helper to send info messages
  const sendInfo = async (title: string, message: string) => {
    try {
      await client.tui.showToast({
        body: {
          title,
          message,
          variant: 'info' as const,
          duration: 4000,
        },
      });
    } catch {
      // Silently fail - toast not critical
    }
  };

  const sendSuccess = async (title: string, message: string) => {
    try {
      await client.tui.showToast({
        body: {
          title,
          message,
          variant: 'success' as const,
          duration: 3000,
        },
      });
    } catch {
      // Silently fail - toast not critical
    }
  };

  const sendWarning = async (title: string, message: string) => {
    try {
      await client.tui.showToast({
        body: {
          title,
          message,
          variant: 'warning' as const,
          duration: 5000,
        },
      });
    } catch {
      // Silently fail - toast not critical
    }
  };

  await sendInfo('OpenCode Core Plugin', `Initializing plugin in ${worktree}`);

  // Load core agents
  const coreAgents = [new OpencodeSpecialistAgent()];

  await sendInfo(
    'Core Agents',
    `Loaded ${coreAgents.length} core agent(s): ${coreAgents.map((s) => s.name).join(', ')}`,
  );

  // Initialize skills plugin
  const skillsPlugin = createSkillsPlugin(
    {
      'opencode-agent-development': opencodeAgentDevelopmentSkill,
      'opencode-custom-tools': opencodeCustomToolsSkill,
      'opencode-plugin-development': opencodePluginDevelopmentSkill,
    },
    {
      debug: false,
      autoInject: true,
    },
  );

  // Get skills hooks
  const skillsHooks = await skillsPlugin(ctx);

  // Return plugin hooks
  return {
    /**
     * Config hook - Register core agents with OpenCode configuration
     */
    config: async (config) => {
      await sendInfo('Config', 'Registering core agents with OpenCode config');

      // Initialize agent config if not present
      if (!config.agent) {
        config.agent = {};
      }

      // Register each core agent
      for (const spec of coreAgents) {
        if (config.agent[spec.name]) {
          await sendWarning('Config', `Agent "${spec.name}" already exists, skipping registration`);
          continue;
        }

        // Register the agent configuration
        config.agent[spec.name] = spec.config;

        await sendInfo('Config', `Registered agent: ${spec.name}`);
      }

      await sendSuccess('Config', 'Core agent registration complete');
    },

    /**
     * Chat message hook - Auto-inject skills when detected
     */
    'chat.message': skillsHooks['chat.message'],
  };
};
