/**
 * Load default agent specifications that ship with the plugin
 *
 * This module provides functions to load the built-in agent specifications
 * based on plugin configuration.
 */

import {
  CodeReviewerAgent,
  DocumentationWriterAgent,
  PerformanceOptimizerAgent,
  RefactoringExpertAgent,
  SecurityAuditorAgent,
  TestEngineerAgent,
} from '../agents';
import type { AgentSpec, AugmentedPluginConfig } from '../types';

/**
 * Get all available default agent constructors
 *
 * @returns Array of agent constructor classes
 */
export const getDefaultAgentConstructors = () => {
  return [
    CodeReviewerAgent,
    SecurityAuditorAgent,
    TestEngineerAgent,
    DocumentationWriterAgent,
    RefactoringExpertAgent,
    PerformanceOptimizerAgent,
  ];
};

/**
 * Load default agent specifications based on configuration
 *
 * @param config - Plugin configuration
 * @returns Array of agent spec instances
 */
export const loadDefaultAgents = (config: AugmentedPluginConfig): AgentSpec[] => {
  // Check if default agents are disabled
  if (config.enableDefaultAgents === false) {
    if (config.verbose) {
    }
    return [];
  }

  const disabledAgents = new Set(config.disabledDefaultAgents || []);
  const agentConstructors = getDefaultAgentConstructors();
  const agents: AgentSpec[] = [];

  for (const AgentConstructor of agentConstructors) {
    const agent = new AgentConstructor();

    // Skip if this agent is disabled
    if (disabledAgents.has(agent.name)) {
      if (config.verbose) {
      }
      continue;
    }

    agents.push(agent);

    if (config.verbose) {
    }
  }

  return agents;
};
