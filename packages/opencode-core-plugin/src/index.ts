/**
 * opencode-core-plugin - Core OpenCode Agents and Skills
 *
 * This plugin provides core agent specifications and skills for OpenCode,
 * including the OpenCode specialist agent for configuration and usage guidance.
 */

import type { Plugin } from '@opencode-ai/plugin';
import { createNotifier } from '@pantheon-org/opencode-notification';
import { createSkillsPlugin } from '@pantheon-org/opencode-skills';

import { OpencodeSpecialistAgent } from './agents';
import {
  opencodeAgentsSkill,
  opencodeCommandsSkill,
  opencodeConfigurationSkill,
  opencodeCustomToolsSkill,
  opencodePluginsSkill,
  opencodeSkillsSkill,
} from './skills';

// Re-export types for consumer convenience
export type { AgentSpec } from './types';

/**
 * OpenCode Core Plugin
 *
 * Provides core agent specifications including:
 * - opencode: OpenCode configuration and usage specialist
 */
export const OpencodeCorePlugin: Plugin = async (ctx) => {
  const { worktree } = ctx;
  const notify = createNotifier(ctx);

  await notify.info('OpenCode Core Plugin', `Initializing plugin in ${worktree}`);

  // Load core agents
  const coreAgents = [new OpencodeSpecialistAgent()];

  await notify.info(
    'Core Agents',
    `Loaded ${coreAgents.length} core agent(s): ${coreAgents.map((s) => s.name).join(', ')}`,
  );

  // Initialize skills plugin
  const skillsPlugin = createSkillsPlugin(
    {
      'opencode-agents': opencodeAgentsSkill,
      'opencode-commands': opencodeCommandsSkill,
      'opencode-configuration': opencodeConfigurationSkill,
      'opencode-custom-tools': opencodeCustomToolsSkill,
      'opencode-plugins': opencodePluginsSkill,
      'opencode-skills': opencodeSkillsSkill,
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
      await notify.info('Config', 'Registering core agents with OpenCode config');

      // Initialize agent config if not present
      if (!config.agent) {
        config.agent = {};
      }

      // Register each core agent
      for (const spec of coreAgents) {
        if (config.agent[spec.name]) {
          await notify.warning('Config', `Agent "${spec.name}" already exists, skipping registration`);
          continue;
        }

        // Register the agent configuration
        config.agent[spec.name] = spec.config;

        await notify.info('Config', `Registered agent: ${spec.name}`);
      }

      await notify.success('Config', 'Core agent registration complete');
    },

    /**
     * Chat message hook - Auto-inject skills when detected
     */
    'chat.message': skillsHooks['chat.message'],
  };
};
