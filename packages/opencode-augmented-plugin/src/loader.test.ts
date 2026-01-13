import { describe, it, expect } from 'bun:test';

import { validateAgentSpec, isAgentSpecConstructor } from './loader';
import type { AgentSpec } from './types';

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

describe('isAgentSpecConstructor', () => {
  it('should identify valid AgentSpec constructors', () => {
    class ValidAgent implements AgentSpec {
      name = 'test-agent';
      config = {
        description: 'Test agent',
        model: 'anthropic/claude-3-5-sonnet-20241022',
      };
    }
    expect(isAgentSpecConstructor(ValidAgent)).toBe(true);
  });

  it('should reject non-constructor values', () => {
    expect(isAgentSpecConstructor(null)).toBe(false);
    expect(isAgentSpecConstructor(undefined)).toBe(false);
    expect(isAgentSpecConstructor('string')).toBe(false);
    expect(isAgentSpecConstructor(123)).toBe(false);
    expect(isAgentSpecConstructor({})).toBe(false);
  });

  it('should reject classes without required properties', () => {
    class InvalidAgent {
      // Missing name and config
    }
    expect(isAgentSpecConstructor(InvalidAgent)).toBe(false);
  });
});
