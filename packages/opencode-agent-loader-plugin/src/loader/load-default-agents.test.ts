import { describe, it, expect } from 'bun:test';

import type { AugmentedPluginConfig } from '../types';

import { loadDefaultAgents, getDefaultAgentConstructors } from './load-default-agents';

describe('load-default-agents', () => {
  describe('getDefaultAgentConstructors', () => {
    it('should return all default agent constructors', () => {
      const constructors = getDefaultAgentConstructors();

      expect(constructors).toHaveLength(6);
      expect(Array.isArray(constructors)).toBe(true);

      // Verify each constructor is a class
      for (const Constructor of constructors) {
        expect(typeof Constructor).toBe('function');
        expect(Constructor.prototype.constructor).toBe(Constructor);
      }
    });
  });

  describe('loadDefaultAgents', () => {
    it('should load all default agents when enabled', () => {
      const config: AugmentedPluginConfig = {
        enableDefaultAgents: true,
        verbose: false,
      };

      const agents = loadDefaultAgents(config);

      expect(agents).toHaveLength(6);

      // Check agent names
      const agentNames = agents.map((a) => a.name);
      expect(agentNames).toContain('code-reviewer');
      expect(agentNames).toContain('security-auditor');
      expect(agentNames).toContain('test-engineer');
      expect(agentNames).toContain('documentation-writer');
      expect(agentNames).toContain('refactoring-expert');
      expect(agentNames).toContain('performance-optimizer');
    });

    it('should return empty array when default agents are disabled', () => {
      const config: AugmentedPluginConfig = {
        enableDefaultAgents: false,
        verbose: false,
      };

      const agents = loadDefaultAgents(config);

      expect(agents).toHaveLength(0);
    });

    it('should exclude disabled agents', () => {
      const config: AugmentedPluginConfig = {
        enableDefaultAgents: true,
        disabledDefaultAgents: ['code-reviewer', 'security-auditor'],
        verbose: false,
      };

      const agents = loadDefaultAgents(config);

      expect(agents).toHaveLength(4);

      const agentNames = agents.map((a) => a.name);
      expect(agentNames).not.toContain('code-reviewer');
      expect(agentNames).not.toContain('security-auditor');
      expect(agentNames).toContain('test-engineer');
      expect(agentNames).toContain('documentation-writer');
      expect(agentNames).toContain('refactoring-expert');
      expect(agentNames).toContain('performance-optimizer');
    });

    it('should handle empty disabledDefaultAgents array', () => {
      const config: AugmentedPluginConfig = {
        enableDefaultAgents: true,
        disabledDefaultAgents: [],
        verbose: false,
      };

      const agents = loadDefaultAgents(config);

      expect(agents).toHaveLength(6);
    });

    it('should load agents with valid AgentSpec structure', () => {
      const config: AugmentedPluginConfig = {
        enableDefaultAgents: true,
        verbose: false,
      };

      const agents = loadDefaultAgents(config);

      for (const agent of agents) {
        // Verify agent has name
        expect(typeof agent.name).toBe('string');
        expect(agent.name.length).toBeGreaterThan(0);

        // Verify agent has config
        expect(agent.config).toBeDefined();
        expect(typeof agent.config).toBe('object');

        // Verify config has expected properties
        expect(agent.config.description).toBeDefined();
        expect(typeof agent.config.description).toBe('string');
      }
    });

    it('should handle disabling non-existent agents gracefully', () => {
      const config: AugmentedPluginConfig = {
        enableDefaultAgents: true,
        disabledDefaultAgents: ['non-existent-agent'],
        verbose: false,
      };

      const agents = loadDefaultAgents(config);

      // Should still load all actual agents
      expect(agents).toHaveLength(6);
    });

    it('should default to enabled when enableDefaultAgents is undefined', () => {
      const config: AugmentedPluginConfig = {
        verbose: false,
        // enableDefaultAgents is undefined
      };

      const agents = loadDefaultAgents(config);

      // Should load agents since default is enabled
      expect(agents).toHaveLength(6);
    });
  });
});
