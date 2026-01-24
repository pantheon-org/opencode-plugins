/**
 * Type definitions for agent specifications
 */

import type { AgentConfig } from '@opencode-ai/sdk';

/**
 * Interface that agent specification classes must implement
 */
export interface AgentSpec {
  /**
   * The unique name of the agent (used as key in OpenCode config)
   * Should be kebab-case, e.g., 'opencode'
   */
  name: string;

  /**
   * The agent configuration following OpenCode's AgentConfig schema
   */
  config: AgentConfig;
}
