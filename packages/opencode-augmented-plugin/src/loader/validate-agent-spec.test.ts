import { describe, it, expect } from 'bun:test';

import type { AgentSpec } from '../types';

import { validateAgentSpec } from './validate-agent-spec';

describe('validateAgentSpec', () => {
  it('should accept valid kebab-case agent names', () => {
    const validSpec: AgentSpec = {
      name: 'my-agent',
      config: {
        description: 'Test agent',
        model: 'anthropic/claude-3-5-sonnet-20241022',
      },
    };
    expect(() => validateAgentSpec(validSpec)).not.toThrow();
  });

  it('should reject names with uppercase letters', () => {
    const invalidSpec: AgentSpec = {
      name: 'MyAgent',
      config: {
        description: 'Test agent',
        model: 'anthropic/claude-3-5-sonnet-20241022',
      },
    };
    expect(() => validateAgentSpec(invalidSpec)).toThrow('Agent name must be kebab-case');
  });

  it('should reject names starting with numbers', () => {
    const invalidSpec: AgentSpec = {
      name: '123-agent',
      config: {
        description: 'Test agent',
        model: 'anthropic/claude-3-5-sonnet-20241022',
      },
    };
    expect(() => validateAgentSpec(invalidSpec)).toThrow('Agent name must be kebab-case');
  });

  it('should reject names with spaces', () => {
    const invalidSpec: AgentSpec = {
      name: 'my agent',
      config: {
        description: 'Test agent',
        model: 'anthropic/claude-3-5-sonnet-20241022',
      },
    };
    expect(() => validateAgentSpec(invalidSpec)).toThrow('Agent name must be kebab-case');
  });

  it('should reject specs without name', () => {
    const invalidSpec = {
      config: {
        description: 'Test agent',
        model: 'anthropic/claude-3-5-sonnet-20241022',
      },
    } as unknown as AgentSpec;
    expect(() => validateAgentSpec(invalidSpec)).toThrow('Agent spec must have a name property');
  });

  it('should reject specs without config', () => {
    const invalidSpec = {
      name: 'my-agent',
    } as unknown as AgentSpec;
    expect(() => validateAgentSpec(invalidSpec)).toThrow('Agent spec must have a config property');
  });
});
